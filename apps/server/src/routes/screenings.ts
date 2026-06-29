import { Hono } from 'hono'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { screeningCreateSchema, triage } from '@pinequest/core'
import { screenings, screeningReviews, children, schoolClasses } from '@pinequest/db/d1'
import { authenticate, authorize } from '../middleware/auth.js'
import { writeAudit } from '../lib/audit.js'
import { persistScreening } from '../lib/persistScreening.js'
import { hasChildAccess, resolveScope, scopeWhere } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const screeningRoutes = new Hono<AppEnv>()

screeningRoutes.post('/', authenticate, async (c) => {
  const db = c.get('db')
  const body = screeningCreateSchema.parse(await c.req.json())
  // A device may only submit screenings for classes/schools within its scope.
  if (!(await hasChildAccess(db, c.get('jwtPayload'), body))) return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  const result = triage(body.findings, body.symptoms)
  const screening = await persistScreening(db, body, result, c.get('jwtPayload').sub)
  return c.json({ success: true, data: screening }, 201)
})

screeningRoutes.get('/', authenticate, async (c) => {
  const db = c.get('db')
  const { childKey, classId, schoolId, seasonId, screenedById } = c.req.query()
  const scope = await resolveScope(db, c.get('jwtPayload'))
  const conds = [
    scopeWhere(scope, { classId: screenings.classId, schoolId: screenings.schoolId, childKey: screenings.childKey }),
    childKey ? eq(screenings.childKey, childKey) : undefined,
    classId ? eq(screenings.classId, classId) : undefined,
    schoolId ? eq(screenings.schoolId, schoolId) : undefined,
    seasonId ? eq(screenings.seasonId, seasonId) : undefined,
    screenedById ? eq(screenings.screenedById, screenedById) : undefined,
  ].filter(Boolean)
  const data = await db.query.screenings.findMany({
    where: conds.length ? and(...conds) : undefined,
    orderBy: desc(screenings.capturedAt),
    with: { findings: true, review: { columns: { confirmedLevel: true } } },
  })

  // Resolve roster names for display. PII stays in the roster, but the requester
  // is already scope-limited to their own classes/school, so attaching names here
  // is consistent with the board's roster-status view. Non-roster keys (parent /
  // direct screenings) simply resolve to null.
  const keys = [...new Set(data.map((s) => s.childKey))]
  const kids = keys.length
    ? await db.select({ childKey: children.childKey, classId: children.classId, firstName: children.firstName, lastName: children.lastName })
        .from(children).where(inArray(children.childKey, keys))
    : []
  const nameByKey = new Map(kids.map((k) => [`${k.classId}::${k.childKey}`, `${k.lastName} ${k.firstName}`.trim()]))
  const withNames = data.map((s) => ({ ...s, childName: nameByKey.get(`${s.classId}::${s.childKey}`) ?? null }))

  return c.json({ success: true, data: withNames })
})

screeningRoutes.get('/:id', authenticate, async (c) => {
  const db = c.get('db')
  const screening = await db.query.screenings.findFirst({
    where: eq(screenings.id, c.req.param('id')),
    with: { findings: true, images: true, questionnaire: true, review: true },
  })
  if (!screening) return c.json({ success: false, data: null }, 404)
  if (!(await hasChildAccess(db, c.get('jwtPayload'), screening))) return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  const kid = await db.query.children.findFirst({
    where: and(eq(children.classId, screening.classId), eq(children.childKey, screening.childKey)),
    columns: { firstName: true, lastName: true, birthYear: true },
  })
  const childName = kid ? `${kid.lastName} ${kid.firstName}`.trim() : null
  const klass = await db.query.schoolClasses.findFirst({
    where: eq(schoolClasses.id, screening.classId),
    columns: { name: true },
  })
  return c.json({
    success: true,
    data: { ...screening, childName, childBirthYear: kid?.birthYear ?? null, className: klass?.name ?? null },
  })
})

screeningRoutes.put('/:id/review', authorize('dentist', 'admin'), async (c) => {
  const db = c.get('db')
  const { confirmedLevel, note } = await c.req.json<{ confirmedLevel: string; note?: string }>()
  if (!['green', 'yellow', 'red'].includes(confirmedLevel)) {
    return c.json({ success: false, data: null, message: 'invalid_level' }, 400)
  }
  const id = c.req.param('id')
  const screening = await db.query.screenings.findFirst({ where: eq(screenings.id, id) })
  if (!screening) return c.json({ success: false, data: null }, 404)

  const existing = await db.query.screeningReviews.findFirst({ where: eq(screeningReviews.screeningId, id) })
  const reviewedById = c.get('jwtPayload').sub
  const [review] = await db.insert(screeningReviews)
    .values({ screeningId: id, confirmedLevel, note: note ?? null, reviewedById })
    .onConflictDoUpdate({ target: screeningReviews.screeningId, set: { confirmedLevel, note: note ?? null, reviewedById } })
    .returning()
  await writeAudit(db, reviewedById, 'ScreeningReview', review.id, existing ? 'override_update' : 'review', existing, review)
  return c.json({ success: true, data: review })
})
