import { Hono } from 'hono'
import { z } from 'zod'
import { and, asc, eq } from 'drizzle-orm'
import { childKey, rosterImportRowSchema } from '@pinequest/core'
import { children, schoolClasses } from '@pinequest/db/d1'
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
