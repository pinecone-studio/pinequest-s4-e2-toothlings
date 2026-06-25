import { Hono } from 'hono'
import { childKey } from '@pinequest/core'
import { prisma } from '@pinequest/db'
import { authenticate, authorize } from '../middleware/auth.js'
import type { AppEnv } from '../types.js'

export const classRoutes = new Hono<AppEnv>()

classRoutes.get('/schools/:schoolId/classes', authenticate, async (c) => {
  const classes = await prisma.schoolClass.findMany({
    where: { schoolId: c.req.param('schoolId') },
    orderBy: [{ seasonId: 'desc' }, { name: 'asc' }],
  })
  return c.json({ success: true, data: classes })
})

classRoutes.post('/schools/:schoolId/classes', authorize('admin'), async (c) => {
  const { name, seasonId, gradeLevel } = await c.req.json<{ name: string; seasonId: string; gradeLevel?: number }>()
  const klass = await prisma.schoolClass.create({
    data: { schoolId: c.req.param('schoolId'), name, seasonId, gradeLevel: gradeLevel ?? null },
  })
  return c.json({ success: true, data: klass }, 201)
})

classRoutes.post('/classes/:classId/carry-forward', authorize('admin'), async (c) => {
  const source = await prisma.schoolClass.findUnique({
    where: { id: c.req.param('classId') },
    include: { children: { where: { isActive: true } } },
  })
  if (!source) return c.json({ success: false, data: null }, 404)
  const { newSeasonId, newName } = await c.req.json<{ newSeasonId: string; newName?: string }>()

  const newClass = await prisma.$transaction(async (tx) => {
    const created = await tx.schoolClass.create({
      data: { schoolId: source.schoolId, name: newName ?? source.name, seasonId: newSeasonId, gradeLevel: source.gradeLevel, sourceClassId: source.id },
    })
    if (source.children.length) {
      await tx.child.createMany({
        data: source.children.map((ch) => ({
          classId: created.id,
          schoolId: source.schoolId,
          childKey: childKey({ schoolId: source.schoolId, className: created.name, rosterSlot: ch.rosterSlot, birthYear: ch.birthYear }),
          firstName: ch.firstName, lastName: ch.lastName, birthYear: ch.birthYear,
          rosterSlot: ch.rosterSlot, gender: ch.gender, guardianPhone: ch.guardianPhone,
        })),
      })
    }
    return created
  })
  return c.json({ success: true, data: newClass }, 201)
})
