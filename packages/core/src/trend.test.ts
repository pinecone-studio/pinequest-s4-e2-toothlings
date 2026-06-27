import { describe, it, expect } from 'vitest'
import {
  computeSeasonDelta,
  computeChildTrendSnapshot,
  computeToothLongitudinal,
  toMobileChildTrend,
} from './trend'
import type { ChildSeasonEntry } from '@pinequest/types'

const entry = (seasonId: string, level: 'green' | 'yellow' | 'red', score = 0.5): ChildSeasonEntry =>
  ({ seasonId, effectiveLevel: level, triageScore: score })

describe('computeSeasonDelta', () => {
  it('returns worsened when level increases', () => {
    expect(computeSeasonDelta(entry('2026-fall', 'green'), entry('2026-winter', 'yellow'))).toBe('worsened')
    expect(computeSeasonDelta(entry('2026-fall', 'yellow'), entry('2026-winter', 'red'))).toBe('worsened')
  })

  it('returns improved when level decreases', () => {
    expect(computeSeasonDelta(entry('2026-fall', 'red'), entry('2026-winter', 'yellow'))).toBe('improved')
    expect(computeSeasonDelta(entry('2026-fall', 'red'), entry('2026-winter', 'green'))).toBe('improved')
  })

  it('returns stable when level is same and score diff within eps', () => {
    expect(computeSeasonDelta(entry('2026-fall', 'yellow', 0.5), entry('2026-winter', 'yellow', 0.55))).toBe('stable')
  })

  it('uses score delta for same-level fine-grained worsening', () => {
    expect(computeSeasonDelta(entry('2026-fall', 'yellow', 0.4), entry('2026-winter', 'yellow', 0.6))).toBe('worsened')
    expect(computeSeasonDelta(entry('2026-fall', 'yellow', 0.6), entry('2026-winter', 'yellow', 0.4))).toBe('improved')
  })

  it('returns new on large_gap between seasons', () => {
    expect(computeSeasonDelta(entry('2024-fall', 'red'), entry('2026-spring', 'yellow'))).toBe('new')
  })
})

describe('computeChildTrendSnapshot', () => {
  const ts = '2026-01-01T00:00:00.000Z'

  it('unscreened with empty history', () => {
    const snap = computeChildTrendSnapshot('key1', [], ts)
    expect(snap.tag).toBe('unscreened')
    expect(snap.seasonCount).toBe(0)
  })

  it('first_season with one entry', () => {
    const snap = computeChildTrendSnapshot('key1', [entry('2026-fall', 'red')], ts)
    expect(snap.tag).toBe('first_season')
    expect(snap.currentLevel).toBe('red')
    expect(snap.previousLevel).toBeUndefined()
  })

  it('chronic when last 3 all non-green', () => {
    const h = [entry('2025-fall', 'yellow'), entry('2025-winter', 'red'), entry('2025-spring', 'yellow')]
    expect(computeChildTrendSnapshot('k', h, ts).tag).toBe('chronic')
  })

  it('deteriorating when last 3 monotonically worse', () => {
    const h = [entry('2025-fall', 'green'), entry('2025-winter', 'yellow'), entry('2025-spring', 'red')]
    expect(computeChildTrendSnapshot('k', h, ts).tag).toBe('deteriorating')
  })

  it('improving when last 3 monotonically better', () => {
    const h = [entry('2025-fall', 'red'), entry('2025-winter', 'yellow'), entry('2025-spring', 'green')]
    expect(computeChildTrendSnapshot('k', h, ts).tag).toBe('improving')
  })

  it('volatile when 2+ direction changes', () => {
    const h = [
      entry('2024-fall', 'green'), entry('2024-winter', 'red'),
      entry('2024-spring', 'green'), entry('2025-fall', 'red'),
    ]
    expect(computeChildTrendSnapshot('k', h, ts).tag).toBe('volatile')
  })

  it('improved on last-pair improvement', () => {
    const h = [entry('2026-fall', 'red'), entry('2026-winter', 'green')]
    expect(computeChildTrendSnapshot('k', h, ts).tag).toBe('improved')
  })

  it('worsened on last-pair worsening', () => {
    const h = [entry('2026-fall', 'green'), entry('2026-winter', 'red')]
    expect(computeChildTrendSnapshot('k', h, ts).tag).toBe('worsened')
  })

  it('green→yellow→green = improved (not volatile, only 1 change)', () => {
    const h = [entry('2025-fall', 'green'), entry('2025-winter', 'yellow'), entry('2025-spring', 'green')]
    // Not all non-green (last is green), not monotonic (goes down then up), 1 direction change → last-pair = improved
    expect(computeChildTrendSnapshot('k', h, ts).tag).toBe('improved')
  })

  it('red→yellow→green = improving', () => {
    const h = [entry('2025-fall', 'red'), entry('2025-winter', 'yellow'), entry('2025-spring', 'green')]
    expect(computeChildTrendSnapshot('k', h, ts).tag).toBe('improving')
  })
})

describe('computeToothLongitudinal', () => {
  it('new when no prior findings', () => {
    expect(computeToothLongitudinal({ fdi: 11, className: 'caries' }, [])).toBe('new')
  })

  it('new when no class match', () => {
    expect(computeToothLongitudinal({ fdi: 11, className: 'cavity' }, [{ fdi: 21, className: 'crack' }])).toBe('new')
  })

  it('worsened when class severity increases (caries→cavity)', () => {
    expect(computeToothLongitudinal({ className: 'cavity' }, [{ className: 'caries' }])).toBe('worsened')
  })

  it('resolved when class severity decreases', () => {
    expect(computeToothLongitudinal({ className: 'caries' }, [{ className: 'cavity' }])).toBe('resolved')
  })

  it('stable when same class', () => {
    expect(computeToothLongitudinal({ fdi: 11, className: 'caries' }, [{ fdi: 11, className: 'caries' }])).toBe('stable')
  })

  it('confidence change alone does not cause worsened', () => {
    // Same class (caries→caries): stable regardless of confidence change
    expect(computeToothLongitudinal({ className: 'caries' }, [{ className: 'caries' }])).toBe('stable')
  })
})

describe('toMobileChildTrend', () => {
  const base = { childKey: 'k', seasonCount: 2, resolvedFdiCodes: [], newFdiCodes: [], latestSeasonId: '2026-fall', latestCapturedAt: '', recentHistory: [] }

  it('maps first_season → first badge', () => {
    const snap = { ...base, tag: 'first_season' as const, currentLevel: 'red' as const, seasonCount: 1 }
    expect(toMobileChildTrend(snap).badge).toBe('first')
  })

  it('maps chronic → chronic badge', () => {
    const snap = { ...base, tag: 'chronic' as const, currentLevel: 'yellow' as const }
    expect(toMobileChildTrend(snap).badge).toBe('chronic')
  })

  it('maps improved → better badge', () => {
    const snap = { ...base, tag: 'improved' as const, currentLevel: 'green' as const, previousLevel: 'red' as const }
    expect(toMobileChildTrend(snap).badge).toBe('better')
    expect(toMobileChildTrend(snap).badgeLabelMn).toBe('Сайжирсан')
  })
})
