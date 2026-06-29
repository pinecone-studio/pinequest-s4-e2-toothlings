import fs from 'node:fs'
import path from 'node:path'
import { NextResponse, type NextRequest } from 'next/server'

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

interface GeminiAnalysis {
  triage: TriageLevel
  advice: string
  detections: Array<{
    label: string
    confidence: number
    box: [number, number, number, number]
  }>
}

// ── Convert 0-1000 Gemini coords to % ────────────────────────────────────────

const geminiBoxToPercent = (
  box: unknown,
): { x: number; y: number; w: number; h: number } | null => {
  if (
    !Array.isArray(box) ||
    box.length < 4 ||
    box.some((v) => typeof v !== 'number' || !isFinite(v))
  ) {
    return null
  }
  const [y1, x1, y2, x2] = box as [number, number, number, number]
  return {
    x: x1 / 10,
    y: y1 / 10,
    w: (x2 - x1) / 10,
    h: (y2 - y1) / 10,
  }
}

// ── Fallback advice ───────────────────────────────────────────────────────────

const fallbackAdvice = (level: TriageLevel, count: number): string => {
  if (level === 'red')
    return `Яаралтай тусламж шаардлагатай байна. ${count} газарт ноцтой өөрчлөлт илэрлээ. Өнөөдөр эсвэл маргааш шүдний эмчид заавал үзүүлнэ үү.`
  if (level === 'yellow')
    return `${count} газарт анхаарал шаарддаг өөрчлөлт илэрлээ. Ойрын 1-2 долоо хоногт шүдний эмчид үзүүлэхийг зөвлөж байна.`
  return 'Шүдний байдал харьцангуй хэвийн байна. Жил бүрийн урьдчилан сэргийлэх үзлэгээ тогтмол хийлгэж байгаарай.'
}

// ── Extract text from Gemini response ────────────────────────────────────────

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

// ── Parse Gemini JSON ─────────────────────────────────────────────────────────

const parseGeminiPayload = (text: string): GeminiAnalysis => {
  const cleaned = text.trim()
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const candidate = (fenced?.[1] ?? cleaned).trim()
  const firstBrace = candidate.indexOf('{')
  const lastBrace = candidate.lastIndexOf('}')
  const firstBracket = candidate.indexOf('[')
  const lastBracket = candidate.lastIndexOf(']')
  const payload =
    firstBrace >= 0 && lastBrace > firstBrace
      ? candidate.slice(firstBrace, lastBrace + 1)
      : firstBracket >= 0 && lastBracket > firstBracket
        ? candidate.slice(firstBracket, lastBracket + 1)
        : candidate

  try {
    return JSON.parse(payload) as GeminiAnalysis
  } catch (err) {
    console.error('parseGeminiPayload failed. Raw text length:', text.length)
    console.error('Raw text (first 500 chars):', text.slice(0, 500))
    throw err
  }
}

// ── Triage validation ─────────────────────────────────────────────────────────

const VALID_TRIAGE: TriageLevel[] = ['green', 'yellow', 'red']
const validateTriage = (value: unknown): TriageLevel => {
  if (typeof value === 'string' && (VALID_TRIAGE as string[]).includes(value)) {
    return value as TriageLevel
  }
  console.warn(`Unexpected triage value from Gemini: "${value}" — defaulting to "green"`)
  return 'green'
}

// ── Prompt builder ────────────────────────────────────────────────────────────

const buildPrompt = (params: {
  childName?: string
  age?: string
  lastDentalVisit?: string
  hasPain: boolean
  nightPain: boolean
  fever: boolean
  feverSwelling: boolean
  painWhen?: string
  painSince?: string
  filledAt?: string
}) => `Та хүүхдийн шүдний мэргэжилтэн эмч юм. Та өвчтөний эцэг эхтэй тайван, ойлгомжтой, найрсаг байдлаар ярьж байна. Хариуг ЗААВАЛ цэвэр монгол хэлээр бичнэ. Хятад, орос, англи үг огт хэрэглэхгүй.

═══════════════════════════════
ӨВЧТӨНИЙ МЭДЭЭЛЭЛ
═══════════════════════════════
Хүүхдийн нэр     : ${params.childName || 'тодорхойгүй'}
Нас               : ${params.age || 'тодорхойгүй'}
Сүүлд эмчид үзсэн: ${params.lastDentalVisit || 'тодорхойгүй'}
Өвдөлт бий эсэх  : ${params.hasPain ? 'Тийм' : 'Үгүй'}
Өвдөлт ямар үед  : ${params.painWhen || 'тодорхойгүй'}
Хэр удаж өвдөж байна: ${params.painSince || 'тодорхойгүй'}
Шөнийн өвдөлт    : ${params.nightPain ? 'Тийм' : 'Үгүй'}
Халуурч байна уу  : ${params.fever ? 'Тийм' : 'Үгүй'}
Хавдар/дулаарал  : ${params.feverSwelling ? 'Тийм' : 'Үгүй'}
Дүүргэлт хийлгэсэн: ${params.filledAt || 'тодорхойгүй'}

═══════════════════════════════
ЗУРАГНААС ОЛОХ ЗҮЙЛС
═══════════════════════════════
Зургийг маш нарийн үзэж дараахыг тодорхойлно уу:
- Цоорол (кариес) байгаа эсэх, хаана байгааг
- Хагарал, хугарал байгаа эсэх
- Буйлны үрэвсэл шинж байгаа эсэх
- Ерөнхий шүдний байдал эрүүл үү, муу уу

═══════════════════════════════
ХАРИУЛТЫН ЗАГВАР
═══════════════════════════════
advice талбарт эцэг эхэд хандан бичнэ үү:
  • 1-р өгүүлбэр: зургаас юу илэрсэн тухай
  • 2-р өгүүлбэр: өвчтөний шинж тэмдэгтэй хэрхэн холбогдох тухай
  • 3-р өгүүлбэр: дараагийн алхам (яаралтай эсэх, хэзээ эмчид очих)
  • 4-р өгүүлбэр: гэрт авах арга хэмжээ

{
  "triage": "green" эсвэл "yellow" эсвэл "red",
  "advice": "Монгол хэлээр 3-4 өгүүлбэр. Эцэг эхэд ойлгомжтой, тайвшруулсан, мэргэжлийн байдлаар.",
  "detections": [
    {
      "label": "Caries" эсвэл "Cavity" эсвэл "Crack" эсвэл "Healthy",
      "confidence": 0.0-аас 1.0,
      "box": [y1, x1, y2, x2]
    }
  ]
}

TRIAGE ДҮРЭМ:
"red"    → Халуурал + хавдар байгаа, эсвэл хүчтэй шөнийн өвдөлт, эсвэл олон цоорол нэгэн зэрэг
"yellow" → Цоорол эсвэл хагарал байгаа, өвдөлт бий ч яаралтай биш
"green"  → Эрүүл, эсвэл маш бага зэрэг асуудалтай

Зургаас юу ч илрэхгүй бол: "detections": []
Зөвхөн JSON буцаана. Өөр текст огт бичихгүй.`

// ── Main API handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const image = form.get('image')

  if (!(image instanceof Blob)) {
    return NextResponse.json({ message: 'missing_image' }, { status: 400 })
  }
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ message: 'missing_gemini_key' }, { status: 500 })
  }

  const imageBuffer = await image.arrayBuffer()
  const base64Image = Buffer.from(imageBuffer).toString('base64')
  const mimeType = image.type || 'image/jpeg'

  const childName = form.get('childName')?.toString().trim() ?? ''
  const age = form.get('age')?.toString().trim() ?? ''
  const lastDentalVisit = form.get('lastDentalVisit')?.toString().trim() ?? ''
  const hasPain = form.get('hasPain') === 'yes'
  const nightPain = form.get('nightPain') === 'yes'
  const fever = form.get('fever') === 'yes'
  const feverSwelling = form.get('feverSwelling') === 'yes'
  const painWhen = form.get('painWhen')?.toString().trim() ?? ''
  const painSince = form.get('painSince')?.toString().trim() ?? ''
  const filledAt = form.get('filledAt')?.toString().trim() ?? ''

  const promptText = buildPrompt({
    childName,
    age,
    lastDentalVisit,
    hasPain,
    nightPain,
    fever,
    feverSwelling,
    painWhen,
    painSince,
    filledAt,
  })

  const geminiBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0, // ← 0.1 → 0: ижил зурагт ижил хариу, тогтвортой
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  }

  let raw: GeminiAnalysis | null = null
  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Gemini request failed:', errText)
      return NextResponse.json({ message: 'gemini_failed', details: errText }, { status: 502 })
    }

    const data = await res.json()
    const text = extractGeminiResponseText(data)
    if (!text) {
      return NextResponse.json(
        { message: 'gemini_failed', details: JSON.stringify(data) },
        { status: 502 },
      )
    }
    raw = parseGeminiPayload(text)
  } catch (err) {
    console.error('Gemini parse error:', err)
    return NextResponse.json(
      { message: 'gemini_parse_error', details: err instanceof Error ? err.message : String(err) },
      { status: 503 },
    )
  }

  if (!raw) {
    return NextResponse.json(
      { message: 'gemini_failed', details: 'empty_response' },
      { status: 502 },
    )
  }

  const level = validateTriage(raw.triage)
  const rawDetections = Array.isArray(raw.detections) ? raw.detections : []

  const detections: Detection[] = rawDetections
    .slice()
    .sort((a, b) => b.confidence - a.confidence)
    .reduce<Detection[]>((acc, d) => {
      const box = geminiBoxToPercent(d.box)
      if (box === null) {
        console.warn(`Skipping detection "${d.label}" — malformed box:`, d.box)
        return acc
      }
      acc.push({ label: d.label, confidence: d.confidence, box })
      return acc
    }, [])

  const advice =
    typeof raw.advice === 'string' && raw.advice.trim()
      ? raw.advice.trim()
      : fallbackAdvice(level, detections.length)

  const result: AnalysisResult = {
    triage: level,
    urgent: level === 'red',
    needsDoctor: level !== 'green',
    detections,
    advice,
  }

  return NextResponse.json(result)
}
