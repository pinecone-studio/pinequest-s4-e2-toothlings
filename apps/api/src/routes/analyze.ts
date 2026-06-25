import { Hono } from 'hono'
import { detectionsToFindings, normalizeInference, triage, type RawInference } from '@pinequest/core'
import { persistScreening } from '../lib/persistScreening.js'
import { authenticate } from '../middleware/auth.js'
import type { AppEnv } from '../types.js'

export const analyzeRoutes = new Hono<AppEnv>()

analyzeRoutes.post('/analyze', authenticate, async (c) => {
  const inferenceUrl = process.env.INFERENCE_URL
  if (!inferenceUrl) return c.json({ success: false, data: null, message: 'inference_not_configured' }, 503)

  const body = await c.req.parseBody()
  const image = body['image']
  if (!(image instanceof File)) return c.json({ success: false, data: null, message: 'missing_image' }, 400)

  const childKey = body['childKey'] as string | undefined
  const classId = body['classId'] as string | undefined
  const schoolId = body['schoolId'] as string | undefined
  const seasonId = body['seasonId'] as string | undefined
  if (!childKey || !classId || !schoolId || !seasonId) {
    return c.json({ success: false, data: null, message: 'missing_required_fields' }, 400)
  }

  const imageBuffer = Buffer.from(await image.arrayBuffer())
  const form = new FormData()
  form.append('image', new Blob([imageBuffer], { type: 'image/jpeg' }), 'capture.jpg')

  const inferRes = await fetch(inferenceUrl, { method: 'POST', body: form })
  if (!inferRes.ok) return c.json({ success: false, data: null, message: 'inference_failed' }, 502)
  const raw = (await inferRes.json()) as RawInference

  const normalized = normalizeInference(raw, 'server')
  const findings = detectionsToFindings(normalized.detections, () => crypto.randomUUID())
  const triageResult = triage(findings, {})
  const screeningId = crypto.randomUUID()

  await persistScreening(
    {
      id: screeningId, childKey, classId, schoolId, seasonId,
      imageRefs: [`analyze:${screeningId}`],
      findings, symptoms: {}, modelName: 'yolov8',
      contentVersionId: (body['contentVersionId'] as string | undefined) ?? 'content-v1',
      capturedAt: new Date().toISOString(),
      deviceId: body['deviceId'] as string | undefined,
    },
    triageResult,
    c.get('jwtPayload').sub,
  )

  return c.json({
    success: true,
    data: { screeningId, triageLevel: triageResult.level, triageScore: triageResult.score, detections: normalized.detections },
  }, 201)
})
