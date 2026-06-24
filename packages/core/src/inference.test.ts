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
