import { Hono } from 'hono'
import { and, asc, count, desc, eq, inArray, ne } from 'drizzle-orm'
import { childKey, teacherClassCreateSchema } from '@pinequest/core'
import { schoolClasses, children, screenings, screeningReviews, toothFindings, userScopes, users } from '@pinequest/db/d1'
import type { FindingClass, LongitudinalFlag, TriageLevel } from '@pinequest/types'
import { authorize } from '../middleware/auth.js'
import { inChunks } from '../lib/chunk.js'
import { hasClassScope, resolveScope } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const teacherRoutes = new Hono<AppEnv>()

// A teacher's own classes (resolved from their class scopes) with enrolled/screened counts.
teacherRoutes.get('/classes', authorize('teacher', 'admin'), async (c) => {
  const db = c.get('db')
  const scope = await resolveScope(db, c.get('jwtPayload'))
  const order = [desc(schoolClasses.seasonId), asc(schoolClasses.name)] as const
  const classes = scope.all
    ? await db.select().from(schoolClasses).orderBy(...order)
    : scope.classIds.length
      ? await db.select().from(schoolClasses).where(inArray(schoolClasses.id, scope.classIds)).orderBy(...order)
      : []
  const classIds = classes.map((k) => k.id)

  const [enrolledGroups, screenedRows] = classIds.length
    ? await Promise.all([
        db.select({ classId: children.classId, c: count() }).from(children)
          .where(and(inArray(children.classId, classIds), eq(children.isActive, true))).groupBy(children.classId),
        db.selectDistinct({ classId: screenings.classId, childKey: screenings.childKey }).from(screenings)
          .where(inArray(screenings.classId, classIds)),
      ])
    : [[], []]

  const enrolledBy = new Map(enrolledGroups.map((g) => [g.classId, g.c]))
  const screenedBy = new Map<string, number>()
  for (const r of screenedRows) screenedBy.set(r.classId, (screenedBy.get(r.classId) ?? 0) + 1)
  const data = classes.map((k) => ({ ...k, enrolled: enrolledBy.get(k.id) ?? 0, screened: screenedBy.get(k.id) ?? 0 }))
  return c.json({ success: true, data })
})

// Create a class + its roster under the teacher's own school, then grant class scope.
teacherRoutes.post('/classes', authorize('teacher', 'admin'), async (c) => {
  const db = c.get('db')
  const payload = c.get('jwtPayload')
  const body = teacherClassCreateSchema.parse(await c.req.json())

  const me = await db.query.users.findFirst({ where: eq(users.id, payload.sub), columns: { schoolId: true } })
  const schoolId = me?.schoolId ?? payload.schoolId
  if (!schoolId) return c.json({ success: false, data: null, message: 'no_school' }, 400)

  const inserted = await db.insert(schoolClasses).values({
    schoolId, name: body.name, seasonId: body.seasonId, gradeLevel: body.gradeLevel ?? null,
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null, reminderPhone: body.reminderPhone ?? null,
  }).returning().catch(() => null)
  if (!inserted?.[0]) return c.json({ success: false, data: null, message: 'duplicate_class' }, 409)
  const klass = inserted[0]

  if (body.students.length) {
    await inChunks(body.students.map((s) => ({
      classId: klass.id, schoolId,
      childKey: childKey({ schoolId, className: body.name, rosterSlot: s.rosterSlot, birthYear: s.birthYear }),
      firstName: s.firstName, lastName: s.lastName, birthYear: s.birthYear, rosterSlot: s.rosterSlot,
      gender: s.gender ?? null, guardianPhone: s.guardianPhone ?? null, guardianEmail: s.guardianEmail ?? null,
    })), (b) => db.insert(children).values(b))
  }

  if (payload.role === 'teacher') {
    await db.insert(userScopes)
      .values({ userId: payload.sub, scopeKind: 'class', scopeId: klass.id, grantedBy: payload.sub })
      .onConflictDoNothing()
  }
  return c.json({ success: true, data: { ...klass, enrolled: body.students.length, screened: 0 } }, 201)
})

// Per-child status for one class: roster PII + latest triage level. Powers the class
// overview, the red-status list, and coverage ("attendance"). Scoped to class owners.
teacherRoutes.get('/classes/:classId/roster-status', authorize('teacher', 'admin'), async (c) => {
  const db = c.get('db')
  const classId = c.req.param('classId')
  if (!(await hasClassScope(db, c.get('jwtPayload'), classId))) {
    return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  }

  const kids = await db.select().from(children)
    .where(and(eq(children.classId, classId), eq(children.isActive, true))).orderBy(asc(children.rosterSlot))
  const keys = kids.map((k) => k.childKey)
  const scr = keys.length
    ? await db.select({ childKey: screenings.childKey, triageLevel: screenings.triageLevel, capturedAt: screenings.capturedAt })
        .from(screenings).where(and(eq(screenings.classId, classId), inArray(screenings.childKey, keys)))
        .orderBy(desc(screenings.capturedAt))
    : []

  const latest = new Map<string, { level: string; capturedAt: Date }>()
  for (const s of scr) if (!latest.has(s.childKey)) latest.set(s.childKey, { level: s.triageLevel, capturedAt: s.capturedAt })

  const data = kids.map((k) => ({
    id: k.id, childKey: k.childKey, rosterSlot: k.rosterSlot, firstName: k.firstName, lastName: k.lastName,
    birthYear: k.birthYear, guardianEmail: k.guardianEmail, guardianPhone: k.guardianPhone,
    latestLevel: latest.get(k.childKey)?.level ?? null, screenedAt: latest.get(k.childKey)?.capturedAt ?? null,
  }))
  return c.json({ success: true, data })
})

// Minimal prior-season summary cache for mobile offline prefetch.
// Returns NO PII: only childKey, triage level, date-only, and longitudinal finding flags.
// `excludeSeasonId` keeps incomplete current-season data out of the cache.
teacherRoutes.get('/classes/:classId/history-cache', authorize('teacher', 'admin'), async (c) => {
  const db = c.get('db')
  const classId = c.req.param('classId')
  const excludeSeasonId = c.req.query('excludeSeasonId')

  if (!(await hasClassScope(db, c.get('jwtPayload'), classId))) {
    return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  }

  const kids = await db.select({ childKey: children.childKey })
    .from(children).where(and(eq(children.classId, classId), eq(children.isActive, true)))
  if (!kids.length) return c.json({ success: true, data: [] })

  const keys = kids.map((k) => k.childKey)

  // Prior screenings only — exclude current season if specified.
  const scrConds = [inArray(screenings.childKey, keys)]
  if (excludeSeasonId) scrConds.push(ne(screenings.seasonId, excludeSeasonId))

  const scrRows = await db.select({
    childKey: screenings.childKey,
    id: screenings.id,
    seasonId: screenings.seasonId,
    level: screenings.triageLevel,
    capturedAt: screenings.capturedAt,
    confirmed: screeningReviews.confirmedLevel,
  }).from(screenings)
    .leftJoin(screeningReviews, eq(screeningReviews.screeningId, screenings.id))
    .where(and(...scrConds))
    .orderBy(desc(screenings.capturedAt))

  // Latest screening per (child, season).
  const seasonMap = new Map<string, (typeof scrRows)[number]>()
  for (const r of scrRows) {
    const k = `${r.childKey}__${r.seasonId}`
    if (!seasonMap.has(k)) seasonMap.set(k, r)
  }
  const latestPerSeason = [...seasonMap.values()]
  if (!latestPerSeason.length) return c.json({ success: true, data: [] })

  const screeningIds = latestPerSeason.map((r) => r.id)
  const allFindings = await db.select({
    screeningId: toothFindings.screeningId,
    fdi: toothFindings.fdi,
    longitudinal: toothFindings.longitudinal,
  }).from(toothFindings).where(inArray(toothFindings.screeningId, screeningIds))

  const findingsBy = new Map<string, (typeof allFindings)>()
  for (const f of allFindings) {
    const list = findingsBy.get(f.screeningId) ?? []
    list.push(f); findingsBy.set(f.screeningId, list)
  }

  const data = latestPerSeason.map((r) => ({
    childKey: r.childKey,
    seasonId: r.seasonId,
    triageLevel: (r.confirmed ?? r.level) as TriageLevel,
    // Date-only ISO string reduces fingerprinting risk
    capturedAt: r.capturedAt.toISOString().split('T')[0],
    confirmedLevel: (r.confirmed ?? null) as TriageLevel | null,
    longitudinalFlags: (findingsBy.get(r.id) ?? [])
      .filter((f) => f.fdi != null && f.longitudinal != null)
      .map((f) => ({ fdi: f.fdi as number, flag: f.longitudinal as LongitudinalFlag })),
    cachedAt: new Date().toISOString(),
  }))

  return c.json({ success: true, data })
})
