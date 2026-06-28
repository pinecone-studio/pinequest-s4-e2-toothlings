import { detectionsToFindings, normalizeInference, type RawInference } from '@pinequest/core/inference'
import { triage } from '@pinequest/core/triage'
import type { BoundingBox } from '@pinequest/types'
import { NextResponse, type NextRequest } from 'next/server'

const INFERENCE_URL = process.env.INFERENCE_URL ?? 'http://127.0.0.1:8765/analyze'

export const runtime = 'nodejs'

const CLASS_LABEL: Record<string, string> = {
  caries: 'Caries',
  cavity: 'Cavity',
  crack: 'Crack',
}

const toPercentBox = (box: BoundingBox, imageWidth: number, imageHeight: number) => ({
  x: (box.x1 / imageWidth) * 100,
  y: (box.y1 / imageHeight) * 100,
  w: ((box.x2 - box.x1) / imageWidth) * 100,
  h: ((box.y2 - box.y1) / imageHeight) * 100,
})

const adviceFor = (level: 'green' | 'yellow' | 'red', count: number): string => {
  if (level === 'red') {
    return `Яаралтай эмчилгээ шаардлагатай шүднүүд ${count} танигдсан `
  }
  if (level === 'yellow') {
    return 'Эмчилгээ шаардлагатай цоорсон шүднүүд танигдсан.'
  }
  return 'Харьцангуй эрүүл байгаа тул дараагийн хяналт хийнэ.'
}

/** Proxy image upload to YOLOv8 and return triage + percent-scaled detection boxes. */
export async function POST(req: NextRequest) {
  const form = await req.formData()
  const image = form.get('image')
  if (!(image instanceof Blob)) {
    return NextResponse.json({ message: 'missing_image' }, { status: 400 })
  }

  const hasPain = form.get('hasPain') === 'yes'
  const nightPain = form.get('nightPain') === 'yes'
  const fever = form.get('fever') === 'yes'
  const feverSwelling = form.get('feverSwelling') === 'yes'
  const proxy = new FormData()
  proxy.append('image', image, 'capture.jpg')

  let raw: RawInference
  try {
    const res = await fetch(INFERENCE_URL, { method: 'POST', body: proxy })
    if (!res.ok) {
      return NextResponse.json({ message: 'inference_failed' }, { status: 502 })
    }
    raw = (await res.json()) as RawInference
  } catch {
    return NextResponse.json(
      { message: 'inference_unreachable' },
      { status: 503 },
    )
  }

  const normalized = normalizeInference(raw, 'server')
  const findings = detectionsToFindings(normalized.detections, () => crypto.randomUUID())
  const triageResult = triage(findings, {
    painDisturbingSleepOrEating: hasPain || nightPain,
    fever: fever || feverSwelling,
    swelling: feverSwelling,
  })

  const detections = normalized.detections
    .slice()
    .sort((a, b) => b.confidence - a.confidence)
    .map((d) => ({
      label: CLASS_LABEL[d.className] ?? d.className,
      confidence: d.confidence,
      box: toPercentBox(d.box, normalized.imageWidth, normalized.imageHeight),
    }))

  return NextResponse.json({
    triage: triageResult.level,
    urgent: triageResult.level === 'red',
    needsDoctor: triageResult.level !== 'green',
    detections,
    advice: adviceFor(triageResult.level, detections.length),
  })
}
