import type { FastifyInstance } from 'fastify'
import { screeningCreateSchema, triage } from '@pinequest/core'

export const screeningRoutes = async (app: FastifyInstance): Promise<void> => {
  /**
   * Persist a screening as an IMMUTABLE event. Idempotent on the client-generated
   * `id` (upsert with empty update), so a retried sync is a no-op. Triage is
   * recomputed server-side from findings + symptoms — the client value is advisory.
   */
  app.post('/api/screenings', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = screeningCreateSchema.parse(req.body)
    const result = triage(body.findings, body.symptoms)

    const screening = await app.prisma.screening.upsert({
      where: { id: body.id },
      update: {}, // immutable — never edited once stored
      create: {
        id: body.id,
        childKey: body.childKey,
        classId: body.classId,
        schoolId: body.schoolId,
        seasonId: body.seasonId,
        screenedById: req.user.sub,
        triageLevel: result.level,
        triageScore: result.score,
        triageConfidentWording: result.confidentWording,
        triageReason: result.reason ?? null,
        modelName: body.modelName,
        modelVersion: body.modelVersion ?? null,
        contentVersionId: body.contentVersionId,
        capturedAt: new Date(body.capturedAt),
        deviceId: body.deviceId ?? null,
        syncedAt: new Date(),
        findings: {
          create: body.findings.map((f) => ({
            id: f.id,
            fdi: f.fdi ?? null,
            className: f.className,
            classId: f.classId,
            confidence: f.confidence,
            boxX1: f.box.x1,
            boxY1: f.box.y1,
            boxX2: f.box.x2,
            boxY2: f.box.y2,
            longitudinal: f.longitudinal ?? null,
          })),
        },
        images: { create: body.imageRefs.map((ref, order) => ({ ref, order })) },
        questionnaire: { create: { ...body.symptoms } },
      },
      include: { findings: true, images: true, questionnaire: true },
    })

    return reply.code(201).send({ success: true, data: screening })
  })

  // List screenings (immutable events) filtered by child / class / school / season.
  app.get<{
    Querystring: { childKey?: string; classId?: string; schoolId?: string; seasonId?: string }
  }>('/api/screenings', { preHandler: [app.authenticate] }, async (req) => {
    const { childKey, classId, schoolId, seasonId } = req.query
    const screenings = await app.prisma.screening.findMany({
      where: {
        childKey: childKey || undefined,
        classId: classId || undefined,
        schoolId: schoolId || undefined,
        seasonId: seasonId || undefined,
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
        include: { findings: true, images: true, questionnaire: true },
      })
      if (!screening) return reply.code(404).send({ success: false, data: null })
      return { success: true, data: screening }
    },
  )
}
