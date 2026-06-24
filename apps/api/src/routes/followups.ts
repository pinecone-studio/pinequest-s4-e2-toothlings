import type { FastifyInstance } from 'fastify'
import { followUpUpdateSchema } from '@pinequest/core'
import { writeAudit } from '../lib/audit.js'

export const followUpRoutes = async (app: FastifyInstance): Promise<void> => {
  // Worklist, optionally filtered by status / school.
  app.get<{ Querystring: { status?: string; schoolId?: string } }>(
    '/api/followups',
    { preHandler: [app.authorize('follow_up', 'dentist', 'admin')] },
    async (req) => {
      const { status, schoolId } = req.query
      const followUps = await app.prisma.followUp.findMany({
        where: { status: status || undefined, schoolId: schoolId || undefined },
        orderBy: { updatedAt: 'desc' },
      })
      // Resolve childKey → roster for contact info (follow-up workers need it).
      const children = await app.prisma.child.findMany({
        where: { childKey: { in: followUps.map((f) => f.childKey) } },
      })
      const byKey = new Map(children.map((c) => [c.childKey, c]))
      const data = followUps.map((f) => {
        const child = byKey.get(f.childKey)
        return {
          ...f,
          childName: child ? `${child.lastName} ${child.firstName}` : null,
          guardianPhone: child?.guardianPhone ?? null,
        }
      })
      return { success: true, data }
    },
  )

  /**
   * Update follow-up status (the only mutable record). Optimistic-locked on
   * `version`: a stale version is a 409 with the current row. Creates the record
   * on first touch. Every change is audited.
   */
  app.patch<{ Params: { childKey: string } }>(
    '/api/followups/:childKey',
    { preHandler: [app.authorize('follow_up', 'admin')] },
    async (req, reply) => {
      const update = followUpUpdateSchema.parse(req.body)
      const ck = req.params.childKey
      const existing = await app.prisma.followUp.findUnique({ where: { childKey: ck } })

      if (existing && existing.version !== update.version) {
        return reply.code(409).send({ success: false, data: existing, message: 'version_conflict' })
      }

      const fields = {
        status: update.status,
        assignedToId: update.assignedToId ?? null,
        appointmentAt: update.appointmentAt ? new Date(update.appointmentAt) : null,
        notifiedAt: update.notifiedAt ? new Date(update.notifiedAt) : null,
        notificationChannel: update.notificationChannel ?? null,
        notes: update.notes ?? null,
        updatedById: req.user.sub,
      }

      let saved
      if (existing) {
        saved = await app.prisma.followUp.update({
          where: { childKey: ck },
          data: { ...fields, version: existing.version + 1 },
        })
      } else {
        const child = await app.prisma.child.findFirst({ where: { childKey: ck } })
        if (!child) return reply.code(404).send({ success: false, data: null, message: 'unknown_child' })
        saved = await app.prisma.followUp.create({
          data: { childKey: ck, schoolId: child.schoolId, ...fields, version: 1 },
        })
      }

      await writeAudit(app, req.user.sub, 'FollowUp', saved.id, existing ? 'update' : 'create', existing, saved)
      return { success: true, data: saved }
    },
  )
}
