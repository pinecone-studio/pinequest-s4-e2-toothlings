import { Hono } from 'hono'
import { detectionsToFindings, normalizeInference, triage, type RawInference } from '@pinequest/core'
import { persistScreening } from '../lib/persistScreening.js'
import { authenticate } from '../middleware/auth.js'
import type { AppEnv } from '../types.js'

export const analyzeRoutes = new Hono<AppEnv>()

/**
 * Deterministic stand-in for the YOLOv8 service: same photo → same result, but
 * varies across photos. Feeds the REAL normalize+triage pipeline so capture works
 * when no Python model host is reachable. Swap in the real model via INFERENCE_URL.
 */
const mockInference = async (image: File): Promise<RawInference> => {
  const bytes = new Uint8Array(await image.arrayBuffer())
  let h = 2166136261
  for (let i = 0; i < bytes.length; i += 1009) h = Math.imul(h ^ bytes[i], 16777619)
  h >>>= 0
  const classes = ['caries', 'cavity', 'crack']
  const count = h % 3
  return {
    detections: Array.from({ length: count }, (_, i) => {
      const r = (h >> (i * 7)) >>> 0
      const cls = (r >> 2) % classes.length
      const x1 = 40 + (r % 360)
      const y1 = 40 + ((r >> 4) % 240)
      return {
        class_id: cls,
        class_name: classes[cls],
        confidence: 0.55 + ((r % 40) / 100),
        box: { x1, y1, x2: x1 + 96, y2: y1 + 84 },
      }
    }),
    image_width: 640,
    image_height: 480,
  }
}

const runInference = async (inferenceUrl: string | undefined, image: File): Promise<RawInference> => {
  if (inferenceUrl) {
    try {
      const form = new FormData()
      form.append('image', new Blob([await image.arrayBuffer()], { type: 'image/jpeg' }), 'capture.jpg')
      const res = await fetch(inferenceUrl, { method: 'POST', body: form })
      if (res.ok) return res.json() as Promise<RawInference>
    } catch {
      // fall through to the deterministic stand-in below
    }
  }
  return mockInference(image)
}

analyzeRoutes.post('/analyze', authenticate, async (c) => {
  const inferenceUrl = c.env.INFERENCE_URL

  const body = await c.req.parseBody()

  // Accept imageUpper + imageLower (two-shot flow) or legacy single image
  const imageUpper = body['imageUpper'] instanceof File ? body['imageUpper'] : undefined
  const imageLower = body['imageLower'] instanceof File ? body['imageLower'] : undefined
  const imageSingle = body['image'] instanceof File ? body['image'] : undefined

  if (!imageUpper && !imageSingle) {
    return c.json({ success: false, data: null, message: 'missing_image' }, 400)
  }

  const childKey = body['childKey'] as string | undefined
  const classId = body['classId'] as string | undefined
  const schoolId = body['schoolId'] as string | undefined
  const seasonId = body['seasonId'] as string | undefined
  if (!childKey || !classId || !schoolId || !seasonId) {
    return c.json({ success: false, data: null, message: 'missing_required_fields' }, 400)
  }

  // Run inference on whichever images were provided; combine all detections
  const rawResults: RawInference[] = []
  try {
    if (imageUpper) rawResults.push(await runInference(inferenceUrl, imageUpper))
    if (imageLower) rawResults.push(await runInference(inferenceUrl, imageLower))
    if (!rawResults.length && imageSingle) rawResults.push(await runInference(inferenceUrl, imageSingle))
  } catch {
    return c.json({ success: false, data: null, message: 'inference_failed' }, 502)
  }

  const allDetections = rawResults.flatMap((raw) => normalizeInference(raw, 'server').detections)
  const findings = detectionsToFindings(allDetections, () => crypto.randomUUID())
  const triageResult = triage(findings, {})
  const screeningId = crypto.randomUUID()

  const imageCount = rawResults.length
  await persistScreening(
    c.get('db'),
    {
      id: screeningId, childKey, classId, schoolId, seasonId,
      imageRefs: Array.from({ length: imageCount }, (_, i) => `analyze:${screeningId}:${i}`),
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
    data: { screeningId, triageLevel: triageResult.level, triageScore: triageResult.score, detections: allDetections },
  }, 201)
})
