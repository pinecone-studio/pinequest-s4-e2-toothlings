import type { FastifyInstance } from 'fastify'
import { screeningCreateSchema, triage } from '@pinequest/core'
import { writeAudit } from '../lib/audit.js'
import { persistScreening } from '../lib/persistScreening.js'

export const screeningRoutes = async (app: FastifyInstance): Promise<void> => {
  // Idempotent on client-generated UUID — retried device sync is a no-op.
  app.post('/api/screenings', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = screeningCreateSchema.parse(req.body)
    const result = triage(body.findings, body.symptoms)
    const screening = await persistScreening(app, body, result, req.user.sub)
    return reply.code(201).send({ success: true, data: screening })
  })

  app.get<{
    Querystring: {
      childKey?: string
      classId?: string
      schoolId?: string
      seasonId?: string
      screenedById?: string
    }
  }>('/api/screenings', { preHandler: [app.authenticate] }, async (req) => {
    const { childKey, classId, schoolId, seasonId, screenedById } = req.query
    const screenings = await app.prisma.screening.findMany({
      where: {
        childKey: childKey || undefined,
        classId: classId || undefined,
        schoolId: schoolId || undefined,
        seasonId: seasonId || undefined,
        screenedById: screenedById || undefined,
      },
      orderBy: { capturedAt: 'desc' },
      include: { findings: true },
    })
    return { success: true, data: screenings }
  })

  app.get<{ Params: { id: string } }>(
    '/api/screenings/:id',
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const screening = await app.prisma.screening.findUnique({
        where: { id: req.params.id },
        include: { findings: true, images: true, questionnaire: true, review: true },
      })
      if (!screening) return reply.code(404).send({ success: false, data: null })
      return { success: true, data: screening }
    },
  )

  app.put<{ Params: { id: string }; Body: { confirmedLevel: string; note?: string } }>(
    '/api/screenings/:id/review',
    { preHandler: [app.authorize('dentist', 'admin')] },
    async (req, reply) => {
      const { confirmedLevel, note } = req.body
      if (!['green', 'yellow', 'red'].includes(confirmedLevel)) {
        return reply.code(400).send({ success: false, data: null, message: 'invalid_level' })
      }
      const screening = await app.prisma.screening.findUnique({ where: { id: req.params.id } })
      if (!screening) return reply.code(404).send({ success: false, data: null })

      const existing = await app.prisma.screeningReview.findUnique({
        where: { screeningId: req.params.id },
      })
      const review = await app.prisma.screeningReview.upsert({
        where: { screeningId: req.params.id },
        update: { confirmedLevel, note: note ?? null, reviewedById: req.user.sub },
        create: {
          screeningId: req.params.id,
          confirmedLevel,
          note: note ?? null,
          reviewedById: req.user.sub,
        },
      })
      await writeAudit(
        app,
        req.user.sub,
        'ScreeningReview',
        review.id,
        existing ? 'override_update' : 'review',
        existing,
        review,
      )
      return { success: true, data: review }
    },
  )
}
