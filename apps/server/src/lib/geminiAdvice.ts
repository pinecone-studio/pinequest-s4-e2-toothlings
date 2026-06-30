/**
 * Gemini зөвхөн эцэг эхэд зориулсан ЗӨВЛӨМЖ-ийн текст гаргана — detection/triage
 * биш. Энэ нь web дэх /api/inference/analyze-ийн advice seam-тэй ижил зарчим:
 * triage логик TS (packages/core) дотор үлдэнэ, загвар/AI зөвхөн илрүүлэлт + зөвлөмж.
 */
import { QUADRANT_LABEL_MN } from '@pinequest/core'
import type { InferenceDetection, Quadrant, SymptomSet, TriageLevel } from '@pinequest/types'

/** One captured region + the detections the model found on its photo. */
export type PhotoDetections = { quadrant: Quadrant; detections: InferenceDetection[] }

// YOLO class_name (snake_case) → УI дээр харуулах нэр.
const CLASS_LABEL: Record<string, string> = {
  caries: 'Кариес',
  cavity: 'Цооролт',
  crack: 'Хагарал',
}

const SYMPTOM_LABEL: Record<keyof SymptomSet, string> = {
  swelling: 'хавдар',
  painDisturbingSleepOrEating: 'нойр/хооллолтыг алдагдуулах өвдөлт',
  fever: 'халуурах',
  gumPimpleOrFistula: 'буйлны буглаа',
  trauma: 'гэмтэл',
}

/** Gemini унавал / тохиргоогүй үед ашиглах энгийн зөвлөмж. */
export const fallbackAdvice = (level: TriageLevel, count: number): string => {
  if (level === 'red')
    return `Яаралтай тусламж шаардлагатай байна. ${count} газарт ноцтой өөрчлөлт илэрлээ. Өнөөдөр эсвэл маргааш шүдний эмчид заавал үзүүлнэ үү.`
  if (level === 'yellow')
    return `${count} газарт анхаарал шаарддаг өөрчлөлт илэрлээ. Ойрын 1-2 долоо хоногт шүдний эмчид үзүүлэхийг зөвлөж байна.`
  return 'Шүдний байдал харьцангуй хэвийн байна. Жил бүрийн урьдчилан сэргийлэх үзлэгээ тогтмол хийлгэж байгаарай.'
}

const extractGeminiResponseText = (data: unknown): string => {
  const candidates =
    (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> } | undefined)
      ?.candidates ?? []
  const parts = candidates.flatMap((c) => c.content?.parts ?? [])
  return parts
    .map((p) => p.text ?? '')
    .filter(Boolean)
    .join('\n')
    .trim()
}

const parseAdvice = (text: string): string => {
  const cleaned = text.trim()
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const candidate = (fenced?.[1] ?? cleaned).trim()
  const firstBrace = candidate.indexOf('{')
  const lastBrace = candidate.lastIndexOf('}')
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      const parsed = JSON.parse(candidate.slice(firstBrace, lastBrace + 1)) as { advice?: unknown }
      if (typeof parsed.advice === 'string' && parsed.advice.trim()) return parsed.advice.trim()
    } catch {
      // fall through to raw text
    }
  }
  return candidate
}

const buildAdvicePrompt = (params: {
  triageLevel: TriageLevel
  photos: PhotoDetections[]
  symptoms: SymptomSet
}): string => {
  const totalDetections = params.photos.reduce((n, p) => n + p.detections.length, 0)

  // Group the model's detections by the four captured regions so the advice can
  // reference where each finding was seen (хоншоор/эрүү, баруун/зүүн).
  const findingLines = totalDetections
    ? params.photos
        .map((p) => {
          const header = QUADRANT_LABEL_MN[p.quadrant]
          if (!p.detections.length) return `  ${header}: илрүүлэлт алга`
          const dets = p.detections
            .slice()
            .sort((a, b) => b.confidence - a.confidence)
            .map((d) => `      - ${CLASS_LABEL[d.className] ?? d.className} (итгэлцэл ${(d.confidence * 100).toFixed(0)}%)`)
            .join('\n')
          return `  ${header}:\n${dets}`
        })
        .join('\n')
    : '  (Загвар 4 зургаас цоорол/хагарал илрүүлээгүй)'

  const symptomLines = (Object.keys(params.symptoms) as Array<keyof SymptomSet>)
    .filter((k) => params.symptoms[k])
    .map((k) => `  • ${SYMPTOM_LABEL[k] ?? k}`)
    .join('\n')

  return `Та хүүхдийн шүдний мэргэжилтэн эмч юм. Та өвчтөний эцэг эхтэй тайван, ойлгомжтой, найрсаг байдлаар ярьж байна. Хариуг ЗААВАЛ цэвэр монгол хэлээр бичнэ. Хятад, орос, англи үг огт хэрэглэхгүй.

ЧУХАЛ: Хүүхдийн амны 4 хэсгийг (хоншоор баруун/зүүн, эрүү баруун/зүүн) тус бүрд нь зураг авч, АГ загвар (YOLO) илрүүлэлт (detection) хийсэн. Доорх хэсэг тус бүрийн илрүүлсэн зүйлс болон аюулын зэрэглэл (triage) нь АЛБАН ЁСНЫ үр дүн — та үүнийг өөрчлөхгүй, зөвхөн эцэг эхэд зориулсан ойлгомжтой ЗӨВЛӨМЖ бичнэ.

═══════════════════════════════
ЗАГВАРЫН ИЛРҮҮЛСЭН ЗҮЙЛС (4 зураг, хэсэг тус бүрээр, албан ёсны)
═══════════════════════════════
Аюулын зэрэглэл (triage): ${params.triageLevel}
${findingLines}

═══════════════════════════════
АСУУМЖИЙН ШИНЖ ТЭМДЭГ
═══════════════════════════════
${symptomLines || '  (Шинж тэмдэг тэмдэглээгүй)'}

═══════════════════════════════
ЗӨВЛӨМЖ БИЧИХ ЗАГВАР
═══════════════════════════════
3-4 өгүүлбэрээр эцэг эхэд хандан бичнэ үү:
  • 1-р өгүүлбэр: 4 зургаас юу, аль хэсэгт илэрсэн тухай (загварын илрүүлэлтэд тулгуурла)
  • 2-р өгүүлбэр: шинж тэмдэгтэй хэрхэн холбогдох тухай
  • 3-р өгүүлбэр: дараагийн алхам (яаралтай эсэх, хэзээ эмчид очих)
  • 4-р өгүүлбэр: гэрт авах арга хэмжээ

Зөвхөн дараах JSON-ийг буцаана. Өөр текст огт бичихгүй:
{ "advice": "Монгол хэлээр 3-4 өгүүлбэр." }`
}

/**
 * Gemini зөвлөмжийн текст гаргана — ЗӨВХӨН YOLO загварын илрүүлэлт + triage +
 * асуумж дээр тулгуурлан (зураг явуулахгүй: зөвлөмж текстээс гардаг тул зургийг
 * нэмэх нь чанарт нөлөөлөхгүй, зөвхөн саатал нэмнэ). Тохиргоо/сүлжээ алдаа гарвал
 * null буцаана — дуудагч fallback хийнэ.
 */
export const runGeminiAdvice = async (params: {
  apiKey: string
  model: string
  triageLevel: TriageLevel
  photos: PhotoDetections[]
  symptoms: SymptomSet
}): Promise<string | null> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    params.model,
  )}:generateContent?key=${params.apiKey}`

  const promptText = buildAdvicePrompt({
    triageLevel: params.triageLevel,
    photos: params.photos,
    symptoms: params.symptoms,
  })

  const parts: Array<Record<string, unknown>> = [{ text: promptText }]

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 512,
      responseMimeType: 'application/json',
      // 3-4 өгүүлбэрийн энгийн зөвлөмжид "бодох" overhead шаардлагагүй —
      // үүнийг унтраах нь 2.5-flash-ийн саатлыг мэдэгдэхүйц багасгана.
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error('Gemini advice request failed:', await res.text().catch(() => ''))
      return null
    }
    const text = extractGeminiResponseText(await res.json())
    return text ? parseAdvice(text) : null
  } catch (err) {
    console.error('Gemini advice error:', err)
    return null
  }
}
