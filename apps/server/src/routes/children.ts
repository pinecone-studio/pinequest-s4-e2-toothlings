import { Hono } from 'hono'
import { z } from 'zod'
import { childKey, rosterImportRowSchema } from '@pinequest/core'
import { Prisma, prisma } from '@pinequest/db'
import type { DuplicateWarning } from '@pinequest/types'
import { authenticate, authorize } from '../middleware/auth.js'
import { loadChildSummary } from '../lib/childSummary.js'
import type { AppEnv } from '../types.js'

export const childRoutes = new Hono<AppEnv>()

childRoutes.get('/classes/:classId/children', authenticate, async (c) => {
  const children = await prisma.child.findMany({
    where: { classId: c.req.param('classId'), isActive: true },
    orderBy: { rosterSlot: 'asc' },
  })
  return c.json({ success: true, data: children })
})

childRoutes.post('/classes/:classId/children', authorize('admin'), async (c) => {
  const row = rosterImportRowSchema.parse(await c.req.json())
  const klass = await prisma.schoolClass.findUnique({ where: { id: c.req.param('classId') } })
  if (!klass) return c.json({ success: false, data: null }, 404)
  const key = childKey({ schoolId: klass.schoolId, className: klass.name, rosterSlot: row.rosterSlot, birthYear: row.birthYear })
  try {
    const child = await prisma.child.create({
      data: { classId: klass.id, schoolId: klass.schoolId, childKey: key, firstName: row.firstName, lastName: row.lastName, birthYear: row.birthYear, rosterSlot: row.rosterSlot, gender: row.gender ?? null, guardianPhone: row.guardianPhone ?? null },
    })
    return c.json({ success: true, data: child }, 201)
  } catch {
    return c.json({ success: false, data: null, message: 'duplicate_child' }, 409)
  }
})

childRoutes.post('/classes/:classId/children/bulk', authorize('admin'), async (c) => {
  const rows = z.array(rosterImportRowSchema).parse(await c.req.json())
  const klass = await prisma.schoolClass.findUnique({ where: { id: c.req.param('classId') } })
  if (!klass) return c.json({ success: false, data: null }, 404)

  const existing = await prisma.child.findMany({ where: { classId: klass.id } })
  const slots = new Set(existing.map((ch) => ch.rosterSlot))
  const keys = new Set(existing.map((ch) => ch.childKey))
  const duplicates: DuplicateWarning[] = []
  const toCreate: Prisma.ChildCreateManyInput[] = []

  for (const row of rows) {
    const key = childKey({ schoolId: klass.schoolId, className: klass.name, rosterSlot: row.rosterSlot, birthYear: row.birthYear })
    if (slots.has(row.rosterSlot)) { duplicates.push({ rosterSlot: row.rosterSlot, childKey: key, reason: 'duplicate_slot' }); continue }
    if (keys.has(key)) { duplicates.push({ rosterSlot: row.rosterSlot, childKey: key, reason: 'duplicate_child_key' }); continue }
    slots.add(row.rosterSlot); keys.add(key)
    toCreate.push({ classId: klass.id, schoolId: klass.schoolId, childKey: key, firstName: row.firstName, lastName: row.lastName, birthYear: row.birthYear, rosterSlot: row.rosterSlot, gender: row.gender ?? null, guardianPhone: row.guardianPhone ?? null })
  }
  if (toCreate.length) await prisma.child.createMany({ data: toCreate })
  return c.json({ success: true, data: { created: toCreate.length, duplicates } }, 201)
})

childRoutes.get('/children/:id', authenticate, async (c) => {
  const child = await prisma.child.findUnique({ where: { id: c.req.param('id') } })
  if (!child) return c.json({ success: false, data: null }, 404)
  return c.json({ success: true, data: child })
})

// Compliant per-child screening summary (latest screening), for the board.
childRoutes.get('/children/:id/summary', authenticate, async (c) => {
  const data = await loadChildSummary(c.req.param('id'))
  if (!data) return c.json({ success: false, data: null }, 404)
  return c.json({ success: true, data })
})

childRoutes.put('/children/:id', authorize('admin'), async (c) => {
  const { firstName, lastName, gender, guardianPhone, guardianEmail, consentObtained, isActive } =
    await c.req.json<{ firstName?: string; lastName?: string; gender?: 'M' | 'F'; guardianPhone?: string; guardianEmail?: string; consentObtained?: boolean; isActive?: boolean }>()
  const child = await prisma.child.update({
    where: { id: c.req.param('id') },
    data: { firstName, lastName, gender, guardianPhone, guardianEmail, consentObtained, consentAt: consentObtained ? new Date() : undefined, isActive },
  })
  return c.json({ success: true, data: child })
})
