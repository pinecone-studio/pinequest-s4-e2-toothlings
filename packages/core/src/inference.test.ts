import { describe, it, expect } from 'vitest'
import { detectionsToFindings, normalizeInference, type RawInference } from './inference'

const raw: RawInference = {
  detections: [
    { class_id: 0, class_name: 'Caries', confidence: 0.8, box: { x1: 1, y1: 2, x2: 3, y2: 4 } },
    { class_id: 9, class_name: 'Tooth', confidence: 0.99, box: { x1: 0, y1: 0, x2: 1, y2: 1 } },
  ],
  image_width: 640,
  image_height: 480,
}

describe('normalizeInference', () => {
  it('maps snake_case → camelCase and lowercases class names', () => {
    const r = normalizeInference(raw)
    expect(r.imageWidth).toBe(640)
    expect(r.source).toBe('server')
    expect(r.detections[0]).toEqual({
      classId: 0,
      className: 'caries',
      confidence: 0.8,
      box: { x1: 1, y1: 2, x2: 3, y2: 4 },
    })
  })

  it('drops non-disease classes (e.g. generic "Tooth")', () => {
    expect(normalizeInference(raw).detections).toHaveLength(1)
  })

  it('tags on-device source when asked', () => {
    expect(normalizeInference(raw, 'on_device').source).toBe('on_device')
  })

  it('drops sub-threshold noise (below the display confidence floor)', () => {
    const noisy: RawInference = {
      detections: [
        { class_id: 0, class_name: 'caries', confidence: 0.32, box: { x1: 5, y1: 5, x2: 9, y2: 9 } },
        { class_id: 0, class_name: 'caries', confidence: 0.62, box: { x1: 20, y1: 20, x2: 30, y2: 30 } },
      ],
      image_width: 640,
      image_height: 480,
    }
    const r = normalizeInference(noisy)
    expect(r.detections).toHaveLength(1)
    expect(r.detections[0].confidence).toBe(0.62)
  })

  it('merges heavily-overlapping boxes, keeping the most confident', () => {
    const dup: RawInference = {
      detections: [
        { class_id: 0, class_name: 'caries', confidence: 0.6, box: { x1: 0, y1: 0, x2: 10, y2: 10 } },
        { class_id: 0, class_name: 'caries', confidence: 0.9, box: { x1: 1, y1: 1, x2: 11, y2: 11 } },
      ],
      image_width: 640,
      image_height: 480,
    }
    const r = normalizeInference(dup)
    expect(r.detections).toHaveLength(1)
    expect(r.detections[0].confidence).toBe(0.9)
  })
})

describe('detectionsToFindings', () => {
  it('assigns ids and carries detection fields', () => {
    let n = 0
    const findings = detectionsToFindings(normalizeInference(raw).detections, () => `id-${n++}`)
    expect(findings).toHaveLength(1)
    expect(findings[0].id).toBe('id-0')
    expect(findings[0].className).toBe('caries')
  })
})
