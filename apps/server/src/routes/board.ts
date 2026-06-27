import { Hono } from 'hono'
import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { children, screenings, screeningReviews, schoolClasses, followUps } from '@pinequest/db/d1'
import { authenticate, authorize } from '../middleware/auth.js'
import { resolveScope, scopeWhere, hasChildAccess } from '../lib/scopeFilter.js'
import { writeAudit } from '../lib/audit.js'
import type { AppEnv } from '../types.js'

const FOLLOWUP_STATUSES = ['flagged', 'contacted', 'doctor_connected', 'treatment_done', 'treatment_refused', 'unclear']

export const boardRoutes = new Hono<AppEnv>()

// Scope-aware roster + each child's latest triage status. ONE query powers the
// Status / Хяналт / Дүгнэлт boards for every role (admin → all, school_doctor →
// school, teacher → class, parent → their child). Effective level prefers the
// dentist's confirmed override over the AI level.
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

  const [classes, scrRows, fuRows] = await Promise.all([
    db.select({ id: schoolClasses.id, name: schoolClasses.name, seasonId: schoolClasses.seasonId })
      .from(schoolClasses).where(inArray(schoolClasses.id, classIds)),
    db.select({
      childKey: screenings.childKey, id: screenings.id, level: screenings.triageLevel,
      confirmed: screeningReviews.confirmedLevel, capturedAt: screenings.capturedAt,
    }).from(screenings)
      .leftJoin(screeningReviews, eq(screeningReviews.screeningId, screenings.id))
      .where(inArray(screenings.childKey, keys))
      .orderBy(desc(screenings.capturedAt)),
    db.select({ childKey: followUps.childKey, status: followUps.status }).from(followUps).where(inArray(followUps.childKey, keys)),
  ])

  const classBy = new Map(classes.map((k) => [k.id, k]))
  const fuBy = new Map(fuRows.map((f) => [f.childKey, f.status]))
  const latest = new Map<string, (typeof scrRows)[number]>()
  for (const r of scrRows) if (!latest.has(r.childKey)) latest.set(r.childKey, r)

  const data = kids.map((k) => {
    const s = latest.get(k.childKey)
    const klass = classBy.get(k.classId)
    return {
      id: k.id, childKey: k.childKey, firstName: k.firstName, lastName: k.lastName,
      rosterSlot: k.rosterSlot, birthYear: k.birthYear, classId: k.classId, schoolId: k.schoolId,
      className: klass?.name ?? '', seasonId: klass?.seasonId ?? '',
      guardianEmail: k.guardianEmail, guardianPhone: k.guardianPhone,
      latestLevel: s ? (s.confirmed ?? s.level) : null,
      latestScreeningId: s?.id ?? null, screenedAt: s?.capturedAt ?? null,
      followUpStatus: fuBy.get(k.childKey) ?? null,
    }
  })
  return c.json({ success: true, data })
})

// Update a flagged child's follow-up status from the board (scoped, upsert).
// last-write-wins by board actor — not the optimistic-locked /api/followups route.
boardRoutes.patch('/students/:childKey/followup', authorize('teacher', 'school_doctor', 'admin'), async (c) => {
  const db = c.get('db')
  const childKey = c.req.param('childKey')
  const { status } = await c.req.json<{ status: string }>()
  if (!FOLLOWUP_STATUSES.includes(status)) return c.json({ success: false, data: null, message: 'invalid_status' }, 400)

  const child = await db.query.children.findFirst({ where: eq(children.childKey, childKey) })
  if (!child) return c.json({ success: false, data: null }, 404)
  if (!(await hasChildAccess(db, c.get('jwtPayload'), child))) return c.json({ success: false, data: null, message: 'forbidden' }, 403)

  const updatedById = c.get('jwtPayload').sub
  const before = await db.query.followUps.findFirst({ where: eq(followUps.childKey, childKey) })
  const [row] = await db.insert(followUps)
    .values({ childKey, schoolId: child.schoolId, status, updatedById })
    .onConflictDoUpdate({ target: followUps.childKey, set: { status, updatedById, updatedAt: new Date() } })
    .returning()
  await writeAudit(db, updatedById, 'FollowUp', row.id, before ? 'followup_update' : 'followup_create', before, row)
  return c.json({ success: true, data: row })
})
