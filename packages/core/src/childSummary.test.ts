import { describe, expect, it } from 'vitest'
import type { SymptomSet, ToothFinding } from '@pinequest/types'
import { buildChildSummary, dentitionStageForAge } from './childSummary.js'

const noSymptoms: SymptomSet = {}
const f = (confidence: number, fdi?: number): ToothFinding => ({
  id: Math.random().toString(36).slice(2),
  className: 'caries',
  classId: 0,
  confidence,
  box: { x1: 0, y1: 0, x2: 1, y2: 1 },
  fdi,
})

// Words that must NEVER appear in parent/teacher-facing copy.
const BANNED = [
  'decay', 'caries', 'cavity', 'healthy teeth', 'no problems', 'all clear',
  'цоорол', 'цоорхой', 'эрүүл шүд', 'асуудалгүй', 'бүх зүйл хэвийн',
]

const allCopy = (s: ReturnType<typeof buildChildSummary>) =>
  [s.headline, ...s.homeSteps].join(' ').toLowerCase()

describe('buildChildSummary', () => {
  it('produces no banned clinical words in any level of copy', () => {
    for (const lvl of ['green', 'yellow', 'red'] as const) {
      const s = buildChildSummary({
        screeningId: 's1', seasonId: '2026-spring', capturedAt: '2026-03-01T00:00:00Z',
        birthYear: 2018, findings: [f(0.8)], symptoms: noSymptoms,
        aiLevel: lvl, confidentWording: true,
      })
      const copy = allCopy(s)
      for (const w of BANNED) expect(copy).not.toContain(w.toLowerCase())
    }
  })

  it('counts flagged areas (not a diagnosis) and buckets by confidence', () => {
    const s = buildChildSummary({
      screeningId: 's1', seasonId: '2026-spring', capturedAt: '2026-03-01T00:00:00Z',
      birthYear: 2018, findings: [f(0.8), f(0.5), f(0.3)], symptoms: noSymptoms,
      aiLevel: 'yellow', confidentWording: false,
    })
    expect(s.flaggedAreas).toBe(3)
    expect(s.flaggedByConfidence).toEqual({ high: 1, moderate: 1, low: 1 })
  })

  it('prefers the dentist-reviewed level for coloring + copy', () => {
    const s = buildChildSummary({
      screeningId: 's1', seasonId: '2026-spring', capturedAt: '2026-03-01T00:00:00Z',
      birthYear: 2018, findings: [f(0.8)], symptoms: noSymptoms,
      aiLevel: 'red', confidentWording: true, reviewedLevel: 'green',
    })
    expect(s.effectiveLevel).toBe('green')
  })

  it('derives dentition stage from age', () => {
    expect(dentitionStageForAge(4)).toBe('primary')
    expect(dentitionStageForAge(9)).toBe('mixed')
    expect(dentitionStageForAge(15)).toBe('permanent')
  })

  it('collects only reported symptom keys', () => {
    const s = buildChildSummary({
      screeningId: 's1', seasonId: '2026-spring', capturedAt: '2026-03-01T00:00:00Z',
      birthYear: 2018, findings: [], symptoms: { swelling: true, fever: false },
      aiLevel: 'green', confidentWording: false,
    })
    expect(s.symptoms).toEqual(['swelling'])
  })
})
