import { Hono } from 'hono'
import { detectionsToFindings, normalizeInference, symptomSetSchema, triage, type RawInference } from '@pinequest/core'
import type { SymptomSet } from '@pinequest/types'
import { persistScreening } from '../lib/persistScreening.js'
import { authenticate } from '../middleware/auth.js'
import { hasChildAccess } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const analyzeRoutes = new Hono<AppEnv>()

/** Parse the device's questionnaire (JSON SymptomSet) — danger signs drive triage. */
const parseSymptoms = (raw: unknown): SymptomSet => {
  if (typeof raw !== 'string') return {}
  try {
    const parsed = symptomSetSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : {}
  } catch {
    return {}
  }
}

const runInference = async (inferenceUrl: string, image: File): Promise<RawInference> => {
  const form = new FormData()
  form.append('image', new Blob([await image.arrayBuffer()], { type: 'image/jpeg' }), 'capture.jpg')
  const res = await fetch(inferenceUrl, { method: 'POST', body: form })
  if (!res.ok) throw new Error('inference_failed')
  return res.json() as Promise<RawInference>
}

analyzeRoutes.post('/analyze', authenticate, async (c) => {
  const inferenceUrl = c.env.INFERENCE_URL
  if (!inferenceUrl) return c.json({ success: false, data: null, message: 'inference_not_configured' }, 503)

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
  if (!(await hasChildAccess(c.get('db'), c.get('jwtPayload'), { childKey, classId, schoolId }))) {
    return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  }

  // Run inference on each provided arch, keeping its detections attributed to the
  // arch so the result UI can draw boxes per photo. All detections still feed ONE
  // screening — never split a two-shot capture across separate screening records.
  const shots: { arch: 'upper' | 'lower'; image: File }[] = []
  if (imageUpper) shots.push({ arch: 'upper', image: imageUpper })
  if (imageLower) shots.push({ arch: 'lower', image: imageLower })
  if (!shots.length && imageSingle) shots.push({ arch: 'upper', image: imageSingle })

  const photos: { arch: 'upper' | 'lower'; detections: ReturnType<typeof normalizeInference>['detections'] }[] = []
  try {
    for (const shot of shots) {
      const raw = await runInference(inferenceUrl, shot.image)
      photos.push({ arch: shot.arch, detections: normalizeInference(raw, 'server').detections })
    }
  } catch {
    return c.json({ success: false, data: null, message: 'inference_failed' }, 502)
  }

  const allDetections = photos.flatMap((p) => p.detections)
  const findings = detectionsToFindings(allDetections, () => crypto.randomUUID())
  const symptoms = parseSymptoms(body['symptoms'])
  const triageResult = triage(findings, symptoms)
  const screeningId = crypto.randomUUID()

  const imageCount = photos.length
  await persistScreening(
    c.get('db'),
    {
      id: screeningId, childKey, classId, schoolId, seasonId,
      imageRefs: Array.from({ length: imageCount }, (_, i) => `analyze:${screeningId}:${i}`),
      findings, symptoms, modelName: 'yolov8',
      capturedAt: new Date().toISOString(),
      deviceId: body['deviceId'] as string | undefined,
    },
    triageResult,
    c.get('jwtPayload').sub,
  )

  return c.json({
    success: true,
    data: {
      screeningId,
      triageLevel: triageResult.level,
      triageScore: triageResult.score,
      detections: allDetections,
      photos,
      modelVersion: c.env.MODEL_VERSION ?? 'yolov8-server',
    },
  }, 201)
})
