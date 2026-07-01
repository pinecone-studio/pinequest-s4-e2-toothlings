import fs from 'node:fs'
import path from 'node:path'
import { NextResponse, type NextRequest } from 'next/server'
import {
  detectionsToFindings,
  normalizeInference,
  SUMMARY_STYLE_GUIDE,
  triage,
  type RawInference,
} from '@pinequest/core'
import type { SymptomSet, ToothFinding } from '@pinequest/types'

export const runtime = 'nodejs'

const readEnvValue = (name: string): string => {
  const fromProcess = process.env[name]?.trim()
  if (fromProcess) return fromProcess

  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps', '.env'),
    path.resolve(process.cwd(), 'apps', 'web', '.env'),
    path.resolve(process.cwd(), '..', '.env'),
    path.resolve(process.cwd(), '..', 'apps', '.env'),
  ]

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue
    const content = fs.readFileSync(file, 'utf8')
    const match = content.match(new RegExp(`^${name}=(.+)$`, 'm'))
    if (match) {
      return match[1].trim().replace(/^['"]|['"]$/g, '')
    }
  }

  return ''
}

const GEMINI_API_KEY = readEnvValue('GEMINI_API_KEY')
const GEMINI_MODEL = readEnvValue('GEMINI_MODEL') || 'gemini-2.5-flash'
const INFERENCE_URL = readEnvValue('INFERENCE_URL')

if (!GEMINI_MODEL.trim()) {
  throw new Error('GEMINI_MODEL resolved to an empty string — check your .env file.')
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${GEMINI_API_KEY}`

// ── Return types ─────────────────────────────────────────────────────────────

type TriageLevel = 'green' | 'yellow' | 'red'

interface Detection {
  label: string
  confidence: number
  box: { x: number; y: number; w: number; h: number }
}

// Нас тохирсон, эцэг эхэд зориулсан гэрийн арчилгааны дэлгэрэнгүй зөвлөмж.
interface Guidance {
  homeCare: string
  brushing: string
  diet: string
  prevention: string
  nextStep: string
}

// Gemini-д өгөх ил тод JSON гэрээ (responseSchema) — server талын GUIDANCE_SCHEMA-тай ижил.
// Загварыг яг эдгээр 6 талбарыг, энэ дарааллаар, цэвэр JSON-оор буцаахад хүргэнэ.
const GUIDANCE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    advice: { type: 'STRING' },
    homeCare: { type: 'STRING' },
    brushing: { type: 'STRING' },
    diet: { type: 'STRING' },
    prevention: { type: 'STRING' },
    nextStep: { type: 'STRING' },
  },
  required: ['advice', 'homeCare', 'brushing', 'diet', 'prevention', 'nextStep'],
  propertyOrdering: ['advice', 'homeCare', 'brushing', 'diet', 'prevention', 'nextStep'],
} as const

interface AnalysisResult {
  triage: TriageLevel
  urgent: boolean
  needsDoctor: boolean
  detections: Detection[]
  advice: string
  guidance?: Guidance
  // Core-computed findings + triage detail — forwarded by the web teacher flow when
  // it persists the screening to the DB (POST /api/screenings).
  findings: ToothFinding[]
  triageScore: number
  confidentWording: boolean
}

// YOLO class_name (snake_case) → УI дээр харуулах нэр.
const CLASS_LABEL: Record<string, string> = {
  caries: 'Caries',
  cavity: 'Cavity',
  crack: 'Crack',
}

// ── Fallback advice (Gemini унавал ашиглана) ─────────────────────────────────

const fallbackAdvice = (level: TriageLevel, count: number): string => {
  if (level === 'red')
    return `Яаралтай тусламж шаардлагатай байна. ${count} газарт ноцтой өөрчлөлт илэрлээ. Өнөөдөр эсвэл маргааш шүдний эмчид заавал үзүүлнэ үү.`
  if (level === 'yellow')
    return `${count} газарт анхаарал шаарддаг өөрчлөлт илэрлээ. Ойрын 1-2 долоо хоногт шүдний эмчид үзүүлэхийг зөвлөж байна.`
  return 'Шүдний байдал харьцангуй хэвийн байна. Жил бүрийн урьдчилан сэргийлэх үзлэгээ тогтмол хийлгэж байгаарай.'
}

// Triage зэрэг → эмчид хандах яаралтай байдлын чиглүүлэг. Prompt дотор advice/nextStep-ийг
// жигд найруулахад нэг тодорхой директив болж холбогдоно.
const URGENCY_BY_LEVEL: Record<TriageLevel, string> = {
  green:
    'яаралтай биш — одоогийн зурагт аюулын тод шинж ажиглагдсангүй, дараагийн ээлжит урьдчилан сэргийлэх үзлэгээр үзүүлэхэд хангалттай',
  yellow:
    'ойрын 1-2 долоо хоногт төлөвлөгөөтэйгээр шүдний эмчид үзүүлэх — яаралтай биш ч хойшлуулахгүй',
  red:
    'аль болох хурдан, өнөөдөр эсвэл маргааш шүдний эмчид хандах; өвдөлт, хаван, халуурал нэмэгдвэл яаралтай тусламжид хандах',
}

// ── Gemini: зөвхөн ЗӨВЛӨМЖ (detection/triage биш) ────────────────────────────

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

const asText = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

/**
 * Gemini-ийн structured хариунаас дүгнэлт (advice) + дэлгэрэнгүй зөвлөмжийг (guidance)
 * салгана. responseSchema-ийн ачаар хариу нь markdown/тайлбаргүй цэвэр JSON тул шууд
 * parse хийнэ. Ховор parse алдаа гарвал бүх текстийг advice болгон буцаана.
 */
const parseGuidance = (text: string): { advice: string; guidance?: Guidance } => {
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(text.trim()) as Record<string, unknown>
  } catch {
    return { advice: text.trim() }
  }
  const guidance: Guidance = {
    homeCare: asText(parsed.homeCare),
    brushing: asText(parsed.brushing),
    diet: asText(parsed.diet),
    prevention: asText(parsed.prevention),
    nextStep: asText(parsed.nextStep),
  }
  const hasGuidance = Object.values(guidance).some(Boolean)
  return { advice: asText(parsed.advice) || text.trim(), guidance: hasGuidance ? guidance : undefined }
}

const buildAdvicePrompt = (params: {
  childName: string
  age: string
  lastDentalVisit: string
  hasPain: boolean
  nightPain: boolean
  fever: boolean
  feverSwelling: boolean
  painWhen: string
  painSince: string
  filledAt: string
  triageLevel: TriageLevel
  detections: Detection[]
}) => {
  const findingLines = params.detections.length
    ? params.detections
        .map(
          (d, i) =>
            `  ${i + 1}. ${CLASS_LABEL[d.label.toLowerCase()] ?? d.label} — нийцэл ${(d.confidence * 100).toFixed(0)}%`,
        )
        .join('\n')
    : '  (Загвар зургаас цоорол/хагарал илрүүлээгүй)'

  const age = params.age || 'тодорхойгүй'
  const urgency = URGENCY_BY_LEVEL[params.triageLevel]

  return `Та хүүхдийн шүдний мэргэжлийн эмч. Та өвчтөний эцэг эхтэй нүүр тулан, тайван, дулаахан, ойлгомжтой ярьж байна. Бодит эмч хүн шиг найрсаг ярь — эцэг эхийн санааг тайвшруул, гэхдээ шударга, тодорхой зөвлө. Хариуг ЗААВАЛ цэвэр монгол хэлээр бич. Хятад, орос, англи үг болон эмнэлзүйн хүнд нэр томьёо огт хэрэглэхгүй.

ЧУХАЛ: Зураг дээрх илрүүлэлт (detection) болон аюулын зэрэглэл (triage)-ийг АГ загвар (YOLO) аль хэдийн гаргасан — энэ нь АЛБАН ЁСНЫ үр дүн. Та үүнийг өөрчлөхгүй, зөвхөн эцэг эхэд зориулсан ойлгомжтой ЗӨВЛӨМЖ бичнэ. Энэ нь онош биш, эмчид цаг алдалгүй чиглүүлэх урьдчилсан шалгалт.

═══════════════════════════════
ӨВЧТӨНИЙ МЭДЭЭЛЭЛ
═══════════════════════════════
Хүүхдийн нэр        : ${params.childName || 'тодорхойгүй'}
Нас                 : ${age}
Сүүлд эмчид үзсэн   : ${params.lastDentalVisit || 'тодорхойгүй'}
Өвдөлт бий эсэх     : ${params.hasPain ? 'Тийм' : 'Үгүй'}
Өвдөлт ямар үед     : ${params.painWhen || 'тодорхойгүй'}
Хэр удаж өвдөж байна : ${params.painSince || 'тодорхойгүй'}
Шөнийн өвдөлт       : ${params.nightPain ? 'Тийм' : 'Үгүй'}
Халуурч байна уу     : ${params.fever ? 'Тийм' : 'Үгүй'}
Хавдар/дулаарал     : ${params.feverSwelling ? 'Тийм' : 'Үгүй'}
Дүүргэлт хийлгэсэн   : ${params.filledAt || 'тодорхойгүй'}

═══════════════════════════════
ЗАГВАРЫН ИЛРҮҮЛСЭН ШҮДНҮҮД (албан ёсны, өөрчлөхгүй)
═══════════════════════════════
Аюулын зэрэг (triage): ${params.triageLevel}  →  ${urgency}
${findingLines}

═══════════════════════════════
ХАРИУ БИЧИХ ЗААВАР
═══════════════════════════════
${SUMMARY_STYLE_GUIDE}

Доорх JSON-ийн талбар бүрийг ${age} насны хүүхэд, ЭНЭ зургийн бодит илрүүлэлт БА өвчтөний
өгсөн мэдээлэлд (өвдөлт, шөнийн өвдөлт, халуурах, хавдар) тааруулж, ХҮҮХЭД ТУС БҮРТ ялгаатай,
утга төгөлдөр бөглө. Тогтмол хэвшсэн өгүүлбэр давтахгүй.

  • advice     — Эмчийн ГОЛ дүгнэлт (2-3 өгүүлбэр, мэндчилгээгүй). Энэ зурагт ЯГ юу
                 танигдсаныг тодорхой хэл: хэдэн шүд, аль хэсэгт (дээд/доод, баруун/зүүн),
                 цоорол том уу жижиг үү, нийцэл хэр вэ. Халуурах / эрүү нүүр хавагнах /
                 шөнийн өвдөлт зэрэг шинж байвал ЗААВАЛ дурдаж, "шалтгааныг олж яаралтай
                 эмчилгээ хийлгэх шаардлагатай" гэдгийг хэл. Илрүүлэлтгүй ногоон үед "аюулын
                 тод шинж илрээгүй" гэ — "цоорол огт байхгүй" гэж батлахгүй.
  • homeCare   — Яг одоо гэртээ хийх алхмууд (өвдөлт намдаах, юу ажиглах, юунаас зайлсхийх).
  • brushing   — ${age} насанд тохирсон шүд угаах заавар (найруулгын зааврын нэр томьёогоор).
  • diet       — Шүд бэхжүүлэх / хязгаарлах хоол хүнс.
  • prevention — Цоорол ба шүдний эгнээ гажихаас урьдчилан сэргийлэх.
  • nextStep   — Дараагийн алхам: "${urgency}"-д нийцүүлэн хэзээ эмчид хандахыг хэл.

homeCare, brushing, diet, prevention, nextStep талбар бүрийг цэгэн жагсаалтаар бич —
мөр бүр "• "-ээр эхэлж, шинэ мөрөөр (\\n) тусгаарлана.

Зөвхөн дараах бүтэцтэй JSON-ийг буцаана. Markdown, тайлбар, өөр текст огт бичихгүй:
{
  "advice": "...",
  "homeCare": "...",
  "brushing": "...",
  "diet": "...",
  "prevention": "...",
  "nextStep": "..."
}`
}

// ── YOLO inference ────────────────────────────────────────────────────────────

const runYolo = async (image: Blob, mimeType: string): Promise<RawInference> => {
  const form = new FormData()
  form.append('image', new Blob([await image.arrayBuffer()], { type: mimeType }), 'capture.jpg')
  const res = await fetch(INFERENCE_URL, { method: 'POST', body: form })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`inference_failed: HTTP ${res.status} ${detail.slice(0, 200)}`)
  }
  return res.json() as Promise<RawInference>
}

// ── Gemini advice (загварын илрүүлэлт + triage + ЗУРАГ дээр тулгуурлана) ─────────
// Мобайлтай ижил: зургийг inlineData-аар хавсаргана (web нэг л зураг, тал нь хамаагүй).
// triage/detection-ийг YOLO + TS core аль хэдийн шийдсэн — Gemini зөвхөн нас тохирсон
// ЗӨВЛӨМЖ бичнэ, triage-г өөрчлөхгүй.

const runGeminiAdvice = async (
  promptText: string,
  image?: Blob,
): Promise<{ advice: string; guidance?: Guidance } | null> => {
  const parts: Array<Record<string, unknown>> = [{ text: promptText }]
  if (image) {
    try {
      const base64 = Buffer.from(await image.arrayBuffer()).toString('base64')
      parts.push({ inlineData: { mimeType: image.type || 'image/jpeg', data: base64 } })
    } catch {
      // зураг заавал биш — текст-only prompt руу шилжинэ
    }
  }

  const geminiBody = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0,
      // 6 талбартай structured JSON + thinking загварт хүрэлцэхээр өргөн авав
      // (512 байсан нь Кирилл текстийг дунд нь тасалж, JSON parse унагаан → түүхий
      //  JSON-ийг advice болгон харуулдаг байсан). Server талын тохиргоотой ижил.
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
      responseSchema: GUIDANCE_SCHEMA,
      // Thinking унтраав: structured зөвлөмжид reasoning хэрэггүй бөгөөд thinking нь
      // token-ийн төсвийг идэж хариуг хоослох (хоосон guidance → fallback) ба саатал нэмдэг.
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    })
    if (!res.ok) {
      console.error('Gemini advice request failed:', await res.text().catch(() => ''))
      return null
    }
    const text = extractGeminiResponseText(await res.json())
    return text ? parseGuidance(text) : null
  } catch (err) {
    console.error('Gemini advice error:', err)
    return null
  }
}

// ── Main API handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const image = form.get('image')

  if (!(image instanceof Blob)) {
    return NextResponse.json({ message: 'missing_image' }, { status: 400 })
  }
  if (!INFERENCE_URL) {
    return NextResponse.json({ message: 'inference_not_configured' }, { status: 503 })
  }

  // 1) YOLO загвар зургийг илрүүлнэ — энэ бол spine.
  let raw: RawInference
  try {
    raw = await runYolo(image, image.type || 'image/jpeg')
  } catch (err) {
    console.error('YOLO inference failed:', err)
    return NextResponse.json(
      { message: 'inference_unreachable', details: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    )
  }

  // 2) Илрүүлэлтийг normalize хийж, triage-г TS core дотор тооцно (загвар биш).
  const normalized = normalizeInference(raw, 'server')
  const findings = detectionsToFindings(normalized.detections, () => crypto.randomUUID())

  const symptoms: SymptomSet = {
    painDisturbingSleepOrEating: form.get('hasPain') === 'yes' || form.get('nightPain') === 'yes',
    fever: form.get('fever') === 'yes' || form.get('feverSwelling') === 'yes',
    swelling: form.get('feverSwelling') === 'yes',
  }
  const triageResult = triage(findings, symptoms)
  const level = triageResult.level

  const width = normalized.imageWidth || 1
  const height = normalized.imageHeight || 1
  const detections: Detection[] = normalized.detections
    .slice()
    .sort((a, b) => b.confidence - a.confidence)
    .map((d) => ({
      label: CLASS_LABEL[d.className] ?? d.className,
      confidence: d.confidence,
      box: {
        x: (d.box.x1 / width) * 100,
        y: (d.box.y1 / height) * 100,
        w: ((d.box.x2 - d.box.x1) / width) * 100,
        h: ((d.box.y2 - d.box.y1) / height) * 100,
      },
    }))

  // 3) Gemini зөвхөн зөвлөмжийн текст гаргана (илрүүлэлт/triage дээр тулгуурлан).
  const ageStr = form.get('age')?.toString().trim() ?? ''
  let generated: { advice: string; guidance?: Guidance } | null = null
  if (GEMINI_API_KEY) {
    const promptText = buildAdvicePrompt({
      childName: form.get('childName')?.toString().trim() ?? '',
      age: ageStr,
      lastDentalVisit: form.get('lastDentalVisit')?.toString().trim() ?? '',
      hasPain: form.get('hasPain') === 'yes',
      nightPain: form.get('nightPain') === 'yes',
      fever: form.get('fever') === 'yes',
      feverSwelling: form.get('feverSwelling') === 'yes',
      painWhen: form.get('painWhen')?.toString().trim() ?? '',
      painSince: form.get('painSince')?.toString().trim() ?? '',
      filledAt: form.get('filledAt')?.toString().trim() ?? '',
      triageLevel: level,
      detections,
    })
    generated = await runGeminiAdvice(promptText, image)
  }

  // Дүгнэлт/зөвлөмжийг Gemini ЗУРАГ + илрүүлэлт + асуумжид тулгуурлан хүүхэд тус бүрт
  // ялгаатай гаргана (тогтмол хариу байхгүй). Gemini унавал л triage-д тохирсон fallback.
  const advice = generated?.advice ?? fallbackAdvice(level, detections.length)
  const guidance = generated?.guidance

  const result: AnalysisResult = {
    triage: level,
    urgent: level === 'red',
    needsDoctor: level !== 'green',
    detections,
    advice,
    guidance,
    findings,
    triageScore: triageResult.score,
    confidentWording: triageResult.confidentWording,
  }

  return NextResponse.json(result)
}
