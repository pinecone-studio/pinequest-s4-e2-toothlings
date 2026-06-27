import { Hono } from 'hono'
import { z } from 'zod'
import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm'
import { childKey, computeChildTrendSnapshot, rosterImportRowSchema } from '@pinequest/core'
import { children, schoolClasses, screenings, screeningReviews, toothFindings, screeningImages, followUpEpisodes, followUpEvents } from '@pinequest/db/d1'
import type { ChildSeasonEntry, FindingClass, LongitudinalFlag, TriageLevel } from '@pinequest/types'
import type { DuplicateWarning } from '@pinequest/types'
import { authenticate, authorize } from '../middleware/auth.js'
import { loadChildSummary } from '../lib/childSummary.js'
import { hasChildAccess, hasClassScope } from '../lib/scopeFilter.js'
import { inChunks } from '../lib/chunk.js'
import type { AppEnv } from '../types.js'

export const childRoutes = new Hono<AppEnv>()

childRoutes.get('/classes/:classId/children', authenticate, async (c) => {
  const db = c.get('db')
  const classId = c.req.param('classId')
  if (!(await hasClassScope(db, c.get('jwtPayload'), classId))) return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  const data = await db.select().from(children)
    .where(and(eq(children.classId, classId), eq(children.isActive, true)))
    .orderBy(asc(children.rosterSlot))
  return c.json({ success: true, data })
})

childRoutes.post('/classes/:classId/children', authorize('admin'), async (c) => {
  const db = c.get('db')
  const row = rosterImportRowSchema.parse(await c.req.json())
  const klass = await db.query.schoolClasses.findFirst({ where: eq(schoolClasses.id, c.req.param('classId')) })
  if (!klass) return c.json({ success: false, data: null }, 404)
  const key = childKey({ schoolId: klass.schoolId, className: klass.name, rosterSlot: row.rosterSlot, birthYear: row.birthYear })
  try {
    const [child] = await db.insert(children).values({
      classId: klass.id, schoolId: klass.schoolId, childKey: key, firstName: row.firstName, lastName: row.lastName,
      birthYear: row.birthYear, rosterSlot: row.rosterSlot, gender: row.gender ?? null, guardianPhone: row.guardianPhone ?? null,
    }).returning()
    return c.json({ success: true, data: child }, 201)
  } catch {
    return c.json({ success: false, data: null, message: 'duplicate_child' }, 409)
  }
})

childRoutes.post('/classes/:classId/children/bulk', authorize('admin'), async (c) => {
  const db = c.get('db')
  const rows = z.array(rosterImportRowSchema).parse(await c.req.json())
  const klass = await db.query.schoolClasses.findFirst({ where: eq(schoolClasses.id, c.req.param('classId')) })
  if (!klass) return c.json({ success: false, data: null }, 404)

  const existing = await db.select().from(children).where(eq(children.classId, klass.id))
  const slots = new Set(existing.map((ch) => ch.rosterSlot))
  const keys = new Set(existing.map((ch) => ch.childKey))
  const duplicates: DuplicateWarning[] = []
  const toCreate: (typeof children.$inferInsert)[] = []

  for (const row of rows) {
    const key = childKey({ schoolId: klass.schoolId, className: klass.name, rosterSlot: row.rosterSlot, birthYear: row.birthYear })
    if (slots.has(row.rosterSlot)) { duplicates.push({ rosterSlot: row.rosterSlot, childKey: key, reason: 'duplicate_slot' }); continue }
    if (keys.has(key)) { duplicates.push({ rosterSlot: row.rosterSlot, childKey: key, reason: 'duplicate_child_key' }); continue }
    slots.add(row.rosterSlot); keys.add(key)
    toCreate.push({ classId: klass.id, schoolId: klass.schoolId, childKey: key, firstName: row.firstName, lastName: row.lastName, birthYear: row.birthYear, rosterSlot: row.rosterSlot, gender: row.gender ?? null, guardianPhone: row.guardianPhone ?? null })
  }
  await inChunks(toCreate, (b) => db.insert(children).values(b))
  return c.json({ success: true, data: { created: toCreate.length, duplicates } }, 201)
})

childRoutes.get('/children/:id', authenticate, async (c) => {
  const db = c.get('db')
  const child = await db.query.children.findFirst({ where: eq(children.id, c.req.param('id')) })
  if (!child) return c.json({ success: false, data: null }, 404)
  if (!(await hasChildAccess(db, c.get('jwtPayload'), child))) return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  return c.json({ success: true, data: child })
})

childRoutes.get('/children/:id/summary', authenticate, async (c) => {
  const db = c.get('db')
  const child = await db.query.children.findFirst({ where: eq(children.id, c.req.param('id')) })
  if (!child) return c.json({ success: false, data: null }, 404)
  if (!(await hasChildAccess(db, c.get('jwtPayload'), child))) return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  const data = await loadChildSummary(db, c.req.param('id'))
  if (!data) return c.json({ success: false, data: null }, 404)
  return c.json({ success: true, data })
})

childRoutes.put('/children/:id', authorize('teacher', 'school_doctor', 'admin'), async (c) => {
  const db = c.get('db')
  const id = c.req.param('id')
  const current = await db.query.children.findFirst({ where: eq(children.id, id) })
  if (!current) return c.json({ success: false, data: null }, 404)
  if (!(await hasChildAccess(db, c.get('jwtPayload'), current))) return c.json({ success: false, data: null, message: 'forbidden' }, 403)

  const { firstName, lastName, gender, guardianPhone, guardianEmail, consentObtained, isActive } =
    await c.req.json<{ firstName?: string; lastName?: string; gender?: 'M' | 'F'; guardianPhone?: string; guardianEmail?: string; consentObtained?: boolean; isActive?: boolean }>()
  const [child] = await db.update(children).set({
    firstName, lastName, gender, guardianPhone, guardianEmail, consentObtained,
    consentAt: consentObtained ? new Date() : undefined, isActive,
  }).where(eq(children.id, id)).returning()
  return c.json({ success: true, data: child })
})

// Full seasonal history for one child (keyed by childKey — longitudinal identity).
// Lazy-loaded: the board fetches this only when the History tab is opened.
childRoutes.get('/children/by-key/:childKey/history', authenticate, async (c) => {
  const db = c.get('db')
  const ck = c.req.param('childKey')

  const child = await db.query.children.findFirst({ where: eq(children.childKey, ck) })
  if (!child) return c.json({ success: false, data: null }, 404)
  if (!(await hasChildAccess(db, c.get('jwtPayload'), child))) {
    return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  }

  // All screenings for this child, newest first.
  const scrRows = await db.select({
    id: screenings.id, seasonId: screenings.seasonId,
    level: screenings.triageLevel, score: screenings.triageScore,
    confidentWording: screenings.triageConfidentWording,
    capturedAt: screenings.capturedAt,
    confirmed: screeningReviews.confirmedLevel,
  }).from(screenings)
    .leftJoin(screeningReviews, eq(screeningReviews.screeningId, screenings.id))
    .where(eq(screenings.childKey, ck))
    .orderBy(desc(screenings.capturedAt))

  // Latest screening per season (first hit in DESC order).
  const seasonLatest = new Map<string, (typeof scrRows)[number]>()
  for (const r of scrRows) if (!seasonLatest.has(r.seasonId)) seasonLatest.set(r.seasonId, r)
  const latestPerSeason = [...seasonLatest.values()]
    .sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime()) // newest first for client

  if (!latestPerSeason.length) return c.json({ success: true, data: { childKey: ck, seasons: [], trend: null, toothTimeline: [] } })

  // Batch-fetch findings + images for the latest screening of each season.
  const seasonScreeningIds = latestPerSeason.map((r) => r.id)
  const [allFindings, allImages] = await Promise.all([
    db.select().from(toothFindings).where(inArray(toothFindings.screeningId, seasonScreeningIds)),
    db.select().from(screeningImages).where(inArray(screeningImages.screeningId, seasonScreeningIds)),
  ])
  const findingsBy = new Map<string, (typeof allFindings)>()
  for (const f of allFindings) {
    const list = findingsBy.get(f.screeningId) ?? []
    list.push(f); findingsBy.set(f.screeningId, list)
  }
  const imagesBy = new Map<string, string[]>()
  for (const img of allImages.sort((a, b) => a.order - b.order)) {
    const list = imagesBy.get(img.screeningId) ?? []
    list.push(img.ref); imagesBy.set(img.screeningId, list)
  }

  // Build per-season detail objects ascending for trend, then reverse for client (newest first).
  const ascending = [...latestPerSeason].reverse()
  const trendEntries: ChildSeasonEntry[] = ascending.map((r) => ({
    seasonId: r.seasonId,
    effectiveLevel: (r.confirmed ?? r.level) as TriageLevel,
    triageScore: r.score,
  }))
  const trend = computeChildTrendSnapshot(
    ck, trendEntries, latestPerSeason[0].capturedAt.toISOString(),
  )

  // Compare consecutive seasons to get per-season delta.
  const deltaFor = (idx: number): string | null => {
    if (idx === 0) return null
    const prev = trendEntries[idx - 1]
    const curr = trendEntries[idx]
    const d = ({ green: 0, yellow: 1, red: 2 } as Record<string, number>)
    const diff = d[curr.effectiveLevel] - d[prev.effectiveLevel]
    return diff > 0 ? 'worsened' : diff < 0 ? 'improved' : 'stable'
  }

  const seasons = latestPerSeason.map((r, i) => {
    const ascIdx = ascending.findIndex((a) => a.id === r.id)
    const findings = findingsBy.get(r.id) ?? []
    return {
      seasonId: r.seasonId,
      screeningId: r.id,
      aiLevel: r.level as TriageLevel,
      triageScore: r.score,
      confirmedLevel: (r.confirmed ?? null) as TriageLevel | null,
      effectiveLevel: (r.confirmed ?? r.level) as TriageLevel,
      capturedAt: r.capturedAt,
      flaggedAreas: findings.length,
      symptomCount: 0, // populated when questionnaire join is added
      delta: deltaFor(ascIdx),
      findings: findings.map((f) => ({
        fdi: f.fdi,
        className: f.className as FindingClass,
        confidence: f.confidence,
        longitudinal: f.longitudinal as LongitudinalFlag | null,
      })),
      imageRefs: imagesBy.get(r.id) ?? [],
    }
  })

  return c.json({ success: true, data: { childKey: ck, seasons, trend, toothTimeline: [] } })
})

// Episode history for one child — used by the follow-up history panel.
childRoutes.get('/children/by-key/:childKey/episodes', authenticate, async (c) => {
  const db = c.get('db')
  const ck = c.req.param('childKey')

  const child = await db.query.children.findFirst({ where: eq(children.childKey, ck) })
  if (!child) return c.json({ success: false, data: null }, 404)
  if (!(await hasChildAccess(db, c.get('jwtPayload'), child))) {
    return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  }

  const episodes = await db.query.followUpEpisodes.findMany({
    where: eq(followUpEpisodes.childKey, ck),
    orderBy: [desc(followUpEpisodes.updatedAt)],
  })
  const episodeIds = episodes.map((e) => e.id)
  const events = episodeIds.length
    ? await db.select().from(followUpEvents)
        .where(inArray(followUpEvents.episodeId, episodeIds))
        .orderBy(desc(followUpEvents.occurredAt))
    : []
  const eventsBy = new Map<string, (typeof events)>()
  for (const ev of events) {
    const list = eventsBy.get(ev.episodeId) ?? []
    list.push(ev); eventsBy.set(ev.episodeId, list)
  }

  const data = episodes.map((ep) => ({ ...ep, events: eventsBy.get(ep.id) ?? [] }))
  return c.json({ success: true, data })
})

// Soft-delete (immutable spine — we deactivate, never hard-delete). Scoped.
childRoutes.delete('/children/:id', authorize('teacher', 'school_doctor', 'admin'), async (c) => {
  const db = c.get('db')
  const id = c.req.param('id')
  const current = await db.query.children.findFirst({ where: eq(children.id, id) })
  if (!current) return c.json({ success: false, data: null }, 404)
  if (!(await hasChildAccess(db, c.get('jwtPayload'), current))) return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  const [child] = await db.update(children).set({ isActive: false }).where(eq(children.id, id)).returning()
  return c.json({ success: true, data: child })
})
