import { Hono } from 'hono'
import { detectionsToFindings, normalizeInference, QUADRANTS, symptomSetSchema, triage, type RawInference } from '@pinequest/core'
import type { Quadrant, SymptomSet } from '@pinequest/types'
import { persistScreening } from '../lib/persistScreening.js'
import { fallbackAdvice, runGeminiAdvice } from '../lib/geminiAdvice.js'
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

  // Each region photo arrives keyed by its quadrant (`image_<quadrant>`). Collect
  // them in canonical order; fall back to a single legacy `image` field.
  const shots: { quadrant: Quadrant; image: File }[] = []
  for (const q of QUADRANTS) {
    const f = body[`image_${q}`]
    if (f instanceof File) shots.push({ quadrant: q, image: f })
  }
  if (!shots.length) {
    const single = body['image']
    if (single instanceof File) shots.push({ quadrant: 'upperRight', image: single })
  }
  if (!shots.length) {
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

  // Run inference on each region, keeping its detections attributed to the
  // quadrant so the result UI can draw boxes per photo. All detections still feed
  // ONE screening — never split a multi-shot capture across separate records.
  let photos: { quadrant: Quadrant; detections: ReturnType<typeof normalizeInference>['detections'] }[]
  try {
    // Run each region's inference concurrently — they're independent, so awaiting
    // them serially just multiplies the wall-clock latency on the critical path.
    photos = await Promise.all(
      shots.map(async (shot) => {
        const raw = await runInference(inferenceUrl, shot.image)
        return { quadrant: shot.quadrant, detections: normalizeInference(raw, 'server').detections }
      }),
    )
  } catch {
    return c.json({ success: false, data: null, message: 'inference_failed' }, 502)
  }

  const allDetections = photos.flatMap((p) => p.detections)
  const findings = detectionsToFindings(allDetections, () => crypto.randomUUID())
  const symptoms = parseSymptoms(body['symptoms'])
  const triageResult = triage(findings, symptoms)
  const screeningId = crypto.randomUUID()

  // Gemini зөвхөн эцэг эхэд зориулсан зөвлөмжийн текст гаргана (web-тэй ижил seam).
  // triage/detection нь TS core-ийн албан ёсны үр дүн — Gemini үүнийг өөрчлөхгүй.
  // Тохиргоо/сүлжээ алдаа гарвал triage түвшинд тохирсон энгийн зөвлөмж рүү шилжинэ.
  const geminiKey = c.env.GEMINI_API_KEY
  const advice =
    (geminiKey
      ? await runGeminiAdvice({
          apiKey: geminiKey,
          model: c.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
          triageLevel: triageResult.level,
          photos,
          symptoms,
        })
      : null) ?? fallbackAdvice(triageResult.level, allDetections.length)

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
      advice,
      modelVersion: c.env.MODEL_VERSION ?? 'yolov8-server',
    },
  }, 201)
})
