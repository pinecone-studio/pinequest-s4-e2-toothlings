import { Hono } from 'hono'
import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm'
import { children, screenings, screeningReviews, schoolClasses, followUps, followUpEpisodes, followUpEvents } from '@pinequest/db/d1'
import { authenticate, authorize } from '../middleware/auth.js'
import { resolveScope, scopeWhere, hasChildAccess } from '../lib/scopeFilter.js'
import { writeAudit } from '../lib/audit.js'
import { computeChildTrendSnapshot, seasonOrdinal } from '@pinequest/core'
import type { ChildSeasonEntry, TriageLevel } from '@pinequest/types'
import type { AppEnv } from '../types.js'

const FOLLOWUP_STATUSES = [
  'flagged', 'contacted', 'doctor_connected', 'treatment_done', 'treatment_refused', 'unclear',
]

export const boardRoutes = new Hono<AppEnv>()

// Scope-aware roster with each child's latest triage status and full season history.
// One ordered fetch builds both latest and per-season snapshots in a single O(N) pass.
boardRoutes.get('/students', authenticate, async (c) => {
  const db = c.get('db')
  const scope = await resolveScope(db, c.get('jwtPayload'))
  const where = scopeWhere(scope, { classId: children.classId, schoolId: children.schoolId, childKey: children.childKey })

  const kids = await db.select().from(children)
    .where(and(eq(children.isActive, true), where))
    .orderBy(asc(children.classId), asc(children.rosterSlot))
  if (!kids.length) return c.json({ success: true, data: [] })

  const classIds = [...new Set(kids.map((k) => k.classId))]
  const keys = [...new Set(kids.map((k) => k.childKey))]

  const [classes, scrRows, openEpisodes] = await Promise.all([
    db.select({ id: schoolClasses.id, name: schoolClasses.name, seasonId: schoolClasses.seasonId })
      .from(schoolClasses).where(inArray(schoolClasses.id, classIds)),

    // All screenings for these children, newest first.
    // Uses Screening_childKey_capturedAt_idx — no full-table sort.
    db.select({
      childKey: screenings.childKey,
      id: screenings.id,
      level: screenings.triageLevel,
      score: screenings.triageScore,
      seasonId: screenings.seasonId,
      confirmed: screeningReviews.confirmedLevel,
      capturedAt: screenings.capturedAt,
    }).from(screenings)
      .leftJoin(screeningReviews, eq(screeningReviews.screeningId, screenings.id))
      .where(inArray(screenings.childKey, keys))
      .orderBy(desc(screenings.capturedAt)),

    // Open episodes supply followUpStatus + escalationFlag.
    db.select({
      childKey: followUpEpisodes.childKey,
      status: followUpEpisodes.status,
      escalationFlag: followUpEpisodes.escalationFlag,
    }).from(followUpEpisodes)
      .where(and(inArray(followUpEpisodes.childKey, keys), isNull(followUpEpisodes.closedAt))),
  ])

  const classBy = new Map(classes.map((k) => [k.id, k]))
  const episodeBy = new Map(openEpisodes.map((e) => [e.childKey, e]))

  // Single pass: build latest + per-season snapshots.
  const latest = new Map<string, (typeof scrRows)[number]>()
  const seasonMap = new Map<string, Map<string, (typeof scrRows)[number]>>()
  for (const r of scrRows) {
    if (!latest.has(r.childKey)) latest.set(r.childKey, r)
    let seasons = seasonMap.get(r.childKey)
    if (!seasons) { seasons = new Map(); seasonMap.set(r.childKey, seasons) }
    if (!seasons.has(r.seasonId)) seasons.set(r.seasonId, r)
  }

  const data = kids.map((k) => {
    const s = latest.get(k.childKey)
    const klass = classBy.get(k.classId)
    const ep = episodeBy.get(k.childKey)

    // Season history: ascending by capturedAt → trend can read newest-first on client.
    const seasonRows = [...(seasonMap.get(k.childKey)?.values() ?? [])]
      .sort((a, b) => a.capturedAt.getTime() - b.capturedAt.getTime())
    const seasonHistory = seasonRows.map((r) => ({
      seasonId: r.seasonId,
      screeningId: r.id,
      triageLevel: r.level as TriageLevel,
      confirmedLevel: (r.confirmed ?? null) as TriageLevel | null,
      effectiveLevel: (r.confirmed ?? r.level) as TriageLevel,
      screenedAt: r.capturedAt,
    }))

    const trendEntries: ChildSeasonEntry[] = seasonRows.map((r) => ({
      seasonId: r.seasonId,
      effectiveLevel: (r.confirmed ?? r.level) as TriageLevel,
      triageScore: r.score,
    }))
    const trend = computeChildTrendSnapshot(
      k.childKey, trendEntries, s?.capturedAt?.toISOString() ?? '',
    )

    // followUpStatus: prefer open episode, fall back to null.
    const followUpStatus = ep?.status ?? null

    return {
      id: k.id, childKey: k.childKey, firstName: k.firstName, lastName: k.lastName,
      rosterSlot: k.rosterSlot, birthYear: k.birthYear, classId: k.classId, schoolId: k.schoolId,
      className: klass?.name ?? '', seasonId: klass?.seasonId ?? '',
      guardianEmail: k.guardianEmail, guardianPhone: k.guardianPhone,
      latestLevel: s ? ((s.confirmed ?? s.level) as TriageLevel) : null,
      latestScreeningId: s?.id ?? null,
      screenedAt: s?.capturedAt ?? null,
      followUpStatus,
      escalationFlag: ep?.escalationFlag ?? false,
      seasonHistory,
      seasonCount: seasonHistory.length,
      trend,
    }
  })

  return c.json({ success: true, data })
})

// Update a flagged child's follow-up status from the board.
// Writes to the open FollowUpEpisode; also updates legacy FollowUp for Phase C compat.
boardRoutes.patch('/students/:childKey/followup', authorize('teacher', 'school_doctor', 'admin'), async (c) => {
  const db = c.get('db')
  const childKey = c.req.param('childKey')
  const body = await c.req.json<{
    status: string
    appointmentAt?: string | null
    notificationChannel?: string | null
    notes?: string | null
  }>()
  const { status, appointmentAt, notificationChannel, notes } = body
  if (!FOLLOWUP_STATUSES.includes(status)) {
    return c.json({ success: false, data: null, message: 'invalid_status' }, 400)
  }

  const child = await db.query.children.findFirst({ where: eq(children.childKey, childKey) })
  if (!child) return c.json({ success: false, data: null }, 404)
  if (!(await hasChildAccess(db, c.get('jwtPayload'), child))) {
    return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  }

  const actorId = c.get('jwtPayload').sub
  const episodeExtra = {
    ...(appointmentAt !== undefined && { appointmentAt: appointmentAt ? new Date(appointmentAt) : null }),
    ...(notificationChannel !== undefined && { notificationChannel: notificationChannel ?? null }),
    ...(notes !== undefined && { notes: notes ?? null }),
  }

  // Update open episode.
  const openEp = await db.query.followUpEpisodes.findFirst({
    where: and(eq(followUpEpisodes.childKey, childKey), isNull(followUpEpisodes.closedAt)),
  })
  if (openEp) {
    const [updated] = await db.update(followUpEpisodes)
      .set({ status, updatedById: actorId, version: openEp.version + 1, ...episodeExtra })
      .where(eq(followUpEpisodes.id, openEp.id)).returning()
    await db.insert(followUpEvents).values({
      episodeId: openEp.id, childKey, seasonId: openEp.triggerSeasonId,
      fromStatus: openEp.status, toStatus: status,
      actorId, actorRole: c.get('jwtPayload').role,
    })
    // Legacy write for Phase C compat.
    const before = await db.query.followUps.findFirst({ where: eq(followUps.childKey, childKey) })
    const [leg] = await db.insert(followUps)
      .values({ childKey, schoolId: child.schoolId, status, updatedById: actorId })
      .onConflictDoUpdate({ target: followUps.childKey, set: { status, updatedById: actorId, updatedAt: new Date() } })
      .returning()
    await writeAudit(db, actorId, 'FollowUp', leg.id, before ? 'followup_update' : 'followup_create', before, leg)
    return c.json({ success: true, data: updated })
  }

  // No open episode: fall back to legacy-only update (pre-migration data).
  const before = await db.query.followUps.findFirst({ where: eq(followUps.childKey, childKey) })
  const [row] = await db.insert(followUps)
    .values({ childKey, schoolId: child.schoolId, status, updatedById: actorId })
    .onConflictDoUpdate({ target: followUps.childKey, set: { status, updatedById: actorId, updatedAt: new Date() } })
    .returning()
  await writeAudit(db, actorId, 'FollowUp', row.id, before ? 'followup_update' : 'followup_create', before, row)
  return c.json({ success: true, data: row })
})
