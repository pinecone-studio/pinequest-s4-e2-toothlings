import type { FastifyInstance } from 'fastify'
import { detectionsToFindings, normalizeInference, triage, type RawInference } from '@pinequest/core'
import { persistScreening } from '../lib/persistScreening.js'

export const analyzeRoutes = async (app: FastifyInstance): Promise<void> => {
  /**
   * Accept a multipart image upload, forward to the stateless YOLO inference
   * service, normalise the response, compute triage, and persist an immutable
   * Screening event. INFERENCE_URL must point to the Python service (POST /infer).
   */
  app.post('/api/screenings/analyze', { preHandler: [app.authenticate] }, async (req, reply) => {
    const inferenceUrl = process.env.INFERENCE_URL
    if (!inferenceUrl) {
      return reply.code(503).send({ success: false, message: 'inference_not_configured' })
    }

    let imageBuffer: Buffer | null = null
    const fields: Record<string, string> = {}

    for await (const part of req.parts()) {
      if (part.type === 'file' && part.fieldname === 'image') {
        imageBuffer = await part.toBuffer()
      } else if (part.type === 'field') {
        fields[part.fieldname] = String(part.value)
      }
    }

    if (!imageBuffer) return reply.code(400).send({ success: false, message: 'missing_image' })

    const { childKey, classId, schoolId, seasonId } = fields
    if (!childKey || !classId || !schoolId || !seasonId) {
      return reply.code(400).send({ success: false, message: 'missing_required_fields' })
    }

    const form = new FormData()
    form.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), 'capture.jpg')

    const inferRes = await fetch(inferenceUrl, { method: 'POST', body: form })
    if (!inferRes.ok) return reply.code(502).send({ success: false, message: 'inference_failed' })
    const raw = (await inferRes.json()) as RawInference

    const normalized = normalizeInference(raw, 'server')
    const findings = detectionsToFindings(normalized.detections, () => crypto.randomUUID())
    const triageResult = triage(findings, {})
    const screeningId = crypto.randomUUID()

    await persistScreening(
      app,
      {
        id: screeningId,
        childKey,
        classId,
        schoolId,
        seasonId,
        imageRefs: [`analyze:${screeningId}`],
        findings,
        symptoms: {},
        modelName: 'yolov8',
        contentVersionId: fields.contentVersionId ?? 'content-v1',
        capturedAt: new Date().toISOString(),
        deviceId: fields.deviceId,
      },
      triageResult,
      req.user.sub,
    )

    return reply.code(201).send({
      success: true,
      data: {
        screeningId,
        triageLevel: triageResult.level,
        triageScore: triageResult.score,
        detections: normalized.detections,
      },
    })
  })
}
