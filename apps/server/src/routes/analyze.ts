import { Hono } from 'hono'
import { detectionsToFindings, normalizeInference, questionnaireAnswerSchema, QUADRANTS, symptomSetSchema, triage, type RawInference } from '@pinequest/core'
import type { QuestionnaireAnswer, Quadrant, SymptomSet } from '@pinequest/types'
import { persistScreening } from '../lib/persistScreening.js'
import { fallbackAdvice, runGeminiAdvice } from '../lib/geminiAdvice.js'
import { putBufferImages } from '../lib/r2Images.js'
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

/** Parse the device's literal questionnaire Q&A (JSON `{q,a}[]`), dropping junk. */
const parseRawAnswers = (raw: unknown): QuestionnaireAnswer[] => {
  if (typeof raw !== 'string') return []
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
      .map((x) => questionnaireAnswerSchema.safeParse(x))
      .flatMap((r) => (r.success ? [r.data] : []))
  } catch {
    return []
  }
}

// Per-image inference deadline so one slow/stalled region can't hang the whole
// analyze request (which the mobile capture screen blocks on).
const INFERENCE_TIMEOUT_MS = 20_000

const runInference = async (inferenceUrl: string, image: File): Promise<RawInference> => {
  const form = new FormData()
  form.append('image', new Blob([await image.arrayBuffer()], { type: 'image/jpeg' }), 'capture.jpg')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), INFERENCE_TIMEOUT_MS)
  try {
    const res = await fetch(inferenceUrl, { method: 'POST', body: form, signal: controller.signal })
    if (!res.ok) throw new Error('inference_failed')
    return (await res.json()) as RawInference
  } finally {
    clearTimeout(timer)
  }
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
  // Run all regions in parallel — they are independent, so sequential awaits just
  // stacked their latencies. Promise.all preserves quadrant order in the result.
  let photos: { quadrant: Quadrant; detections: ReturnType<typeof normalizeInference>['detections'] }[]
  try {
    photos = await Promise.all(
      shots.map(async (shot) => ({
        quadrant: shot.quadrant,
        detections: normalizeInference(await runInference(inferenceUrl, shot.image), 'server').detections,
      })),
    )
  } catch {
    return c.json({ success: false, data: null, message: 'inference_failed' }, 502)
  }

  const allDetections = photos.flatMap((p) => p.detections)
  const findings = detectionsToFindings(allDetections, () => crypto.randomUUID())
  const symptoms = parseSymptoms(body['symptoms'])
  const rawAnswers = parseRawAnswers(body['rawAnswers'])
  const triageResult = triage(findings, symptoms)
  const screeningId = crypto.randomUUID()

  // Gemini зөвхөн эцэг эхэд зориулсан зөвлөмжийн текст гаргана (web-тэй ижил seam).
  // triage/detection нь TS core-ийн албан ёсны үр дүн — Gemini үүнийг өөрчлөхгүй.
  // Тохиргоо/сүлжээ алдаа гарвал triage түвшинд тохирсон энгийн зөвлөмж рүү шилжинэ.
  const geminiKey = c.env.GEMINI_API_KEY
  const generated = geminiKey
    ? await runGeminiAdvice({
        apiKey: geminiKey,
        model: c.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
        triageLevel: triageResult.level,
        detections: allDetections,
        symptoms,
        age: typeof body['age'] === 'string' ? (body['age'] as string) : undefined,
        image: shots[0]?.image,
      })
    : null
  // Gemini зураг + асуумж (SymptomSet) дээр тулгуурлан хүүхэд тус бүрт ялгаатай дүгнэлт/
  // зөвлөмж гаргана. Gemini унавал л triage түвшинд тохирсон fallback руу шилжинэ.
  const advice = generated?.advice ?? fallbackAdvice(triageResult.level, allDetections.length)
  const guidance = generated?.guidance

  // Upload the actual photo bytes to R2; the DB keeps only the object keys (refs).
  const buffers = await Promise.all(shots.map((s) => s.image.arrayBuffer()))
  const imageRefs = await putBufferImages(c.env.IMAGES, screeningId, buffers)
  await persistScreening(
    c.get('db'),
    {
      id: screeningId, childKey, classId, schoolId, seasonId,
      imageRefs,
      findings, symptoms, rawAnswers, modelName: 'yolov8',
      summary: generated ? { advice, guidance } : undefined,
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
      guidance,
      modelVersion: c.env.MODEL_VERSION ?? 'yolov8-server',
    },
  }, 201)
})
