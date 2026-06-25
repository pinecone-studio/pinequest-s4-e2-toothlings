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
  const classIds = classes.map((k) => k.id)

  // enrolled = active roster size; screened = distinct children with a screening
  const [enrolledGroups, screenedRows] = await Promise.all([
    prisma.child.groupBy({
      by: ['classId'],
      where: { classId: { in: classIds }, isActive: true },
      _count: { _all: true },
    }),
    prisma.screening.findMany({
      where: { classId: { in: classIds } },
      select: { classId: true, childKey: true },
      distinct: ['classId', 'childKey'],
    }),
  ])

  const enrolledBy = new Map(enrolledGroups.map((g) => [g.classId, g._count._all]))
  const screenedBy = new Map<string, number>()
  for (const r of screenedRows) screenedBy.set(r.classId, (screenedBy.get(r.classId) ?? 0) + 1)

  const data = classes.map((k) => ({
    ...k,
    enrolled: enrolledBy.get(k.id) ?? 0,
    screened: screenedBy.get(k.id) ?? 0,
  }))
  return c.json({ success: true, data })
})

classRoutes.post('/schools/:schoolId/classes', authorize('admin'), async (c) => {
  const { name, seasonId, gradeLevel } = await c.req.json<{ name: string; seasonId: string; gradeLevel?: number }>()
  const klass = await prisma.schoolClass.create({
    data: { schoolId: c.req.param('schoolId'), name, seasonId, gradeLevel: gradeLevel ?? null },
  })
  return c.json({ success: true, data: klass }, 201)
})

classRoutes.get('/classes/:classId', authenticate, async (c) => {
  const klass = await prisma.schoolClass.findUnique({ where: { id: c.req.param('classId') } })
  if (!klass) return c.json({ success: false, data: null }, 404)
  return c.json({ success: true, data: klass })
})

// Screeners (and admins) set the next-season visit date + reminder phone.
classRoutes.patch('/classes/:classId/schedule', authorize('screener', 'admin'), async (c) => {
  const { scheduledAt, reminderPhone } = await c.req.json<{ scheduledAt?: string | null; reminderPhone?: string | null }>()
  const updated = await prisma.schoolClass.update({
    where: { id: c.req.param('classId') },
    data: {
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      reminderPhone: reminderPhone ?? null,
    },
  })
  return c.json({ success: true, data: updated })
})

classRoutes.post('/classes/:classId/carry-forward', authorize('screener', 'admin'), async (c) => {
  const source = await prisma.schoolClass.findUnique({
    where: { id: c.req.param('classId') },
    include: { children: { where: { isActive: true } } },
  })
  if (!source) return c.json({ success: false, data: null }, 404)
  const { newSeasonId, newName, scheduledAt, reminderPhone } =
    await c.req.json<{ newSeasonId: string; newName?: string; scheduledAt?: string | null; reminderPhone?: string | null }>()

  const newClass = await prisma.$transaction(async (tx) => {
    const created = await tx.schoolClass.create({
      data: {
        schoolId: source.schoolId,
        name: newName ?? source.name,
        seasonId: newSeasonId,
        gradeLevel: source.gradeLevel,
        sourceClassId: source.id,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        reminderPhone: reminderPhone ?? null,
      },
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
  return c.json({ success: true, data: { ...newClass, enrolled: source.children.length, screened: 0 } }, 201)
})
