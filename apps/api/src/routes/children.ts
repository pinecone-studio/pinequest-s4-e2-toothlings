import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { childKey, rosterImportRowSchema } from '@pinequest/core'
import { Prisma } from '@pinequest/db'
import type { DuplicateWarning } from '@pinequest/types'

export const childRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get<{ Params: { classId: string } }>(
    '/api/classes/:classId/children',
    { preHandler: [app.authenticate] },
    async (req) => {
      const children = await app.prisma.child.findMany({
        where: { classId: req.params.classId, isActive: true },
        orderBy: { rosterSlot: 'asc' },
      })
      return { success: true, data: children }
    },
  )

  // Add one child. childKey is derived from the class + roster, never client-supplied.
  app.post<{ Params: { classId: string } }>(
    '/api/classes/:classId/children',
    { preHandler: [app.authorize('admin')] },
    async (req, reply) => {
      const row = rosterImportRowSchema.parse(req.body)
      const klass = await app.prisma.schoolClass.findUnique({ where: { id: req.params.classId } })
      if (!klass) return reply.code(404).send({ success: false, data: null })
      const key = childKey({ schoolId: klass.schoolId, className: klass.name, rosterSlot: row.rosterSlot, birthYear: row.birthYear })
      try {
        const child = await app.prisma.child.create({
          data: { classId: klass.id, schoolId: klass.schoolId, childKey: key, firstName: row.firstName, lastName: row.lastName, birthYear: row.birthYear, rosterSlot: row.rosterSlot, gender: row.gender ?? null, guardianPhone: row.guardianPhone ?? null },
        })
        return reply.code(201).send({ success: true, data: child })
      } catch {
        return reply.code(409).send({ success: false, data: null, message: 'duplicate_child' })
      }
    },
  )

  // Bulk import a class roster; warn (don't fail) on duplicate slots / childKeys.
  app.post<{ Params: { classId: string } }>(
    '/api/classes/:classId/children/bulk',
    { preHandler: [app.authorize('admin')] },
    async (req, reply) => {
      const rows = z.array(rosterImportRowSchema).parse(req.body)
      const klass = await app.prisma.schoolClass.findUnique({ where: { id: req.params.classId } })
      if (!klass) return reply.code(404).send({ success: false, data: null })

      const existing = await app.prisma.child.findMany({ where: { classId: klass.id } })
      const slots = new Set(existing.map((c) => c.rosterSlot))
      const keys = new Set(existing.map((c) => c.childKey))
      const duplicates: DuplicateWarning[] = []
      const toCreate: Prisma.ChildCreateManyInput[] = []

      for (const row of rows) {
        const key = childKey({ schoolId: klass.schoolId, className: klass.name, rosterSlot: row.rosterSlot, birthYear: row.birthYear })
        if (slots.has(row.rosterSlot)) {
          duplicates.push({ rosterSlot: row.rosterSlot, childKey: key, reason: 'duplicate_slot' })
          continue
        }
        if (keys.has(key)) {
          duplicates.push({ rosterSlot: row.rosterSlot, childKey: key, reason: 'duplicate_child_key' })
          continue
        }
        slots.add(row.rosterSlot)
        keys.add(key)
        toCreate.push({ classId: klass.id, schoolId: klass.schoolId, childKey: key, firstName: row.firstName, lastName: row.lastName, birthYear: row.birthYear, rosterSlot: row.rosterSlot, gender: row.gender ?? null, guardianPhone: row.guardianPhone ?? null })
      }
      if (toCreate.length) await app.prisma.child.createMany({ data: toCreate })
      return reply.code(201).send({ success: true, data: { created: toCreate.length, duplicates } })
    },
  )

  app.get<{ Params: { id: string } }>(
    '/api/children/:id',
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const child = await app.prisma.child.findUnique({ where: { id: req.params.id } })
      if (!child) return reply.code(404).send({ success: false, data: null })
      return { success: true, data: child }
    },
  )

  // Edit ROSTER PII only. Identity fields (rosterSlot, birthYear, class) feed
  // childKey and are intentionally immutable here — a correction is a new entry.
  app.put<{
    Params: { id: string }
    Body: { firstName?: string; lastName?: string; gender?: 'M' | 'F'; guardianPhone?: string; consentObtained?: boolean; isActive?: boolean }
  }>('/api/children/:id', { preHandler: [app.authorize('admin')] }, async (req, reply) => {
    const { firstName, lastName, gender, guardianPhone, consentObtained, isActive } = req.body
    const child = await app.prisma.child.update({
      where: { id: req.params.id },
      data: { firstName, lastName, gender, guardianPhone, consentObtained, consentAt: consentObtained ? new Date() : undefined, isActive },
    })
    return reply.send({ success: true, data: child })
  })
}
