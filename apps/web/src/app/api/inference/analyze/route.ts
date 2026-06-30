import fs from 'node:fs'
import path from 'node:path'
import { NextResponse, type NextRequest } from 'next/server'
import {
  detectionsToFindings,
  normalizeInference,
  triage,
  type RawInference,
} from '@pinequest/core'
import type { SymptomSet } from '@pinequest/types'

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

interface AnalysisResult {
  triage: TriageLevel
  urgent: boolean
  needsDoctor: boolean
  detections: Detection[]
  advice: string
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
            `  ${i + 1}. ${CLASS_LABEL[d.label.toLowerCase()] ?? d.label} — итгэлцэл ${(d.confidence * 100).toFixed(0)}%`,
        )
        .join('\n')
    : '  (Загвар зургаас цоорол/хагарал илрүүлээгүй)'

  return `Та хүүхдийн шүдний мэргэжилтэн эмч юм. Та өвчтөний эцэг эхтэй тайван, ойлгомжтой, найрсаг байдлаар ярьж байна. Хариуг ЗААВАЛ цэвэр монгол хэлээр бичнэ. Хятад, орос, англи үг огт хэрэглэхгүй.

ЧУХАЛ: Шүдний зураг дээрх илрүүлэлтийг (detection) АГ загвар (YOLO) аль хэдийн хийсэн. Доорх илрүүлсэн зүйлс болон аюулын зэрэглэл (triage) нь АЛБАН ЁСНЫ үр дүн — та үүнийг өөрчлөхгүй, зөвхөн эцэг эхэд зориулсан ойлгомжтой ЗӨВЛӨМЖ бичнэ.

═══════════════════════════════
ӨВЧТӨНИЙ МЭДЭЭЛЭЛ
═══════════════════════════════
Хүүхдийн нэр       : ${params.childName || 'тодорхойгүй'}
Нас                : ${params.age || 'тодорхойгүй'}
Сүүлд эмчид үзсэн  : ${params.lastDentalVisit || 'тодорхойгүй'}
Өвдөлт бий эсэх    : ${params.hasPain ? 'Тийм' : 'Үгүй'}
Өвдөлт ямар үед    : ${params.painWhen || 'тодорхойгүй'}
Хэр удаж өвдөж байна: ${params.painSince || 'тодорхойгүй'}
Шөнийн өвдөлт      : ${params.nightPain ? 'Тийм' : 'Үгүй'}
Халуурч байна уу    : ${params.fever ? 'Тийм' : 'Үгүй'}
Хавдар/дулаарал    : ${params.feverSwelling ? 'Тийм' : 'Үгүй'}
Дүүргэлт хийлгэсэн  : ${params.filledAt || 'тодорхойгүй'}

═══════════════════════════════
ЗАГВАРЫН ИЛРҮҮЛСЭН ЗҮЙЛС (албан ёсны)
═══════════════════════════════
Аюулын зэрэглэл (triage): ${params.triageLevel}
${findingLines}

═══════════════════════════════
ЗӨВЛӨМЖ БИЧИХ ЗАГВАР
═══════════════════════════════
3-4 өгүүлбэрээр эцэг эхэд хандан бичнэ үү:
  • 1-р өгүүлбэр: зургаас юу илэрсэн тухай (загварын илрүүлэлтэд тулгуурла)
  • 2-р өгүүлбэр: өвчтөний шинж тэмдэгтэй хэрхэн холбогдох тухай
  • 3-р өгүүлбэр: дараагийн алхам (яаралтай эсэх, хэзээ эмчид очих)
  • 4-р өгүүлбэр: гэрт авах арга хэмжээ

Зөвхөн дараах JSON-ийг буцаана. Өөр текст огт бичихгүй:
{ "advice": "Монгол хэлээр 3-4 өгүүлбэр." }`
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

// ── Gemini advice (ЗӨВХӨН загварын илрүүлэлт + triage дээр тулгуурлана) ─────────
// Зураг явуулахгүй: зөвлөмж detection/triage текстээс гардаг тул зургийг нэмэх нь
// чанарт нөлөөлөхгүй, зөвхөн саатал нэмнэ.

const runGeminiAdvice = async (promptText: string): Promise<string | null> => {
  const geminiBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }],
      },
    ],
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
    return text ? parseAdvice(text) : null
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
  let advice: string | null = null
  if (GEMINI_API_KEY) {
    const promptText = buildAdvicePrompt({
      childName: form.get('childName')?.toString().trim() ?? '',
      age: form.get('age')?.toString().trim() ?? '',
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
    advice = await runGeminiAdvice(promptText)
  }

  const result: AnalysisResult = {
    triage: level,
    urgent: level === 'red',
    needsDoctor: level !== 'green',
    detections,
    advice: advice ?? fallbackAdvice(level, detections.length),
  }

  return NextResponse.json(result)
}
