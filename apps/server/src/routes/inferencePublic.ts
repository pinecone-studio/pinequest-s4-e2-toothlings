import { Hono } from 'hono'
import { detectionsToFindings, normalizeInference, triage, type RawInference } from '@pinequest/core'
import type { AppEnv } from '../types.js'

const CLASS_LABEL: Record<string, string> = {
  caries: 'Caries',
  cavity: 'Cavity',
  crack: 'Crack',
}

const adviceFor = (level: 'green' | 'yellow' | 'red', count: number): string => {
  if (level === 'red')
    return `Шүдний эмчид ойрын хугацаанд үзүүлэхийг зөвлөж байна. ${count} шинж тэмдэг илэрлээ. Өдөрт 2 удаа зөв угааж, чихэрлэг зүйлийг хязгаарлаарай.`
  if (level === 'yellow')
    return 'Шүдний гадаргуу дээр кариесийн шинж илэрсэн. 2 долоо хоногийн дотор эмчид үзүүлэхийг зөвлөж байна. Өдөрт 2 удаа зөв угаалга хий.'
  return 'Аюулын шинж тэмдэг олдсонгүй — шүдний эмчид хянуулахыг зөвлөж байна.'
}

export const inferencePublicRoutes = new Hono<AppEnv>()

/** Stateless inference proxy — no auth, no DB write. Returns triage + percent-scaled boxes. */
inferencePublicRoutes.post('/analyze', async (c) => {
  const inferenceUrl = c.env.INFERENCE_URL
  if (!inferenceUrl) return c.json({ message: 'inference_not_configured' }, 503)

  const body = await c.req.parseBody()
  const image = body['image']
  if (!(image instanceof File)) return c.json({ message: 'missing_image' }, 400)

  const hasPain = body['hasPain'] === 'yes'
  const nightPain = body['nightPain'] === 'yes'
  const fever = body['fever'] === 'yes'
  const feverSwelling = body['feverSwelling'] === 'yes'

  const form = new FormData()
  form.append('image', new Blob([await image.arrayBuffer()], { type: 'image/jpeg' }), 'capture.jpg')

  let raw: RawInference
  try {
    const res = await fetch(inferenceUrl, { method: 'POST', body: form })
    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      return c.json({ message: 'inference_failed', detail: `HTTP ${res.status}: ${errBody.slice(0, 200)}` }, 502)
    }
    raw = (await res.json()) as RawInference
  } catch (e) {
    return c.json({ message: 'inference_unreachable', detail: String(e) }, 503)
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
      box: {
        x: (d.box.x1 / normalized.imageWidth) * 100,
        y: (d.box.y1 / normalized.imageHeight) * 100,
        w: ((d.box.x2 - d.box.x1) / normalized.imageWidth) * 100,
        h: ((d.box.y2 - d.box.y1) / normalized.imageHeight) * 100,
      },
    }))

  return c.json({
    triage: triageResult.level,
    urgent: triageResult.level === 'red',
    needsDoctor: triageResult.level !== 'green',
    detections,
    advice: adviceFor(triageResult.level, detections.length),
  })
})
