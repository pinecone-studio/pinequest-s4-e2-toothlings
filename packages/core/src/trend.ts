import type { ChildSeasonEntry, ChildTrendSnapshot, ChildTrendTag, LongitudinalFlag, MobileChildTrend, TriageLevel } from '@pinequest/types'
import type { FindingClass } from '@pinequest/types'
import { gapBetween } from './season.js'

const LEVEL_NUM: Record<TriageLevel, number> = { green: 0, yellow: 1, red: 2 }
const CLASS_SEVERITY: Record<FindingClass, number> = { crack: 1, caries: 2, cavity: 3 }
const SCORE_EPS = 0.10

/** Season-pair delta: compare two consecutive ChildSeasonEntries. */
export const computeSeasonDelta = (
  prev: ChildSeasonEntry,
  curr: ChildSeasonEntry,
): 'improved' | 'worsened' | 'stable' | 'new' => {
  if (gapBetween(prev.seasonId, curr.seasonId) === 'large_gap') return 'new'
  const diff = LEVEL_NUM[curr.effectiveLevel] - LEVEL_NUM[prev.effectiveLevel]
  if (diff > 0) return 'worsened'
  if (diff < 0) return 'improved'
  const ds = curr.triageScore - prev.triageScore
  return ds > SCORE_EPS ? 'worsened' : ds < -SCORE_EPS ? 'improved' : 'stable'
}

const isMonotonicWorse = (a: TriageLevel, b: TriageLevel, c: TriageLevel) =>
  LEVEL_NUM[a] <= LEVEL_NUM[b] && LEVEL_NUM[b] <= LEVEL_NUM[c] && LEVEL_NUM[a] < LEVEL_NUM[c]

const isMonotonicBetter = (a: TriageLevel, b: TriageLevel, c: TriageLevel) =>
  LEVEL_NUM[a] >= LEVEL_NUM[b] && LEVEL_NUM[b] >= LEVEL_NUM[c] && LEVEL_NUM[a] > LEVEL_NUM[c]

const directionChanges = (history: ChildSeasonEntry[]): number => {
  let changes = 0
  let prev: 'up' | 'down' | null = null
  for (let i = 1; i < history.length; i++) {
    const d = LEVEL_NUM[history[i].effectiveLevel] - LEVEL_NUM[history[i - 1].effectiveLevel]
    if (d === 0) continue
    const dir = d > 0 ? 'up' : 'down'
    if (prev && dir !== prev) changes++
    prev = dir
  }
  return changes
}

const MOBILE_BADGE_MN: Record<MobileChildTrend['badge'], string> = {
  first:   'Анхны шалгалт',
  better:  'Сайжирсан',
  worse:   'Хүнддэсэн',
  same:    'Өөрчлөлтгүй',
  chronic: 'Удаан хугацааны анхааруулга',
}

/**
 * Compute a ChildTrendSnapshot from an ordered history of season entries.
 * `history` must be ascending by seasonOrdinal; caller is responsible for ordering.
 * Pure — no I/O.
 */
export const computeChildTrendSnapshot = (
  childKey: string,
  history: ChildSeasonEntry[],
  latestCapturedAt: string,
): ChildTrendSnapshot => {
  const seasonCount = history.length
  const recentHistory = history.slice(-5)
  const latest = history[history.length - 1]

  let tag: ChildTrendTag = 'unscreened'

  if (seasonCount === 0) {
    tag = 'unscreened'
  } else if (seasonCount === 1) {
    tag = 'first_season'
  } else {
    const last3 = history.slice(-3).map((h) => h.effectiveLevel)
    const allNonGreen = last3.every((l) => l !== 'green')

    if (last3.length === 3 && allNonGreen) {
      tag = 'chronic'
    } else if (last3.length === 3 && isMonotonicWorse(last3[0], last3[1], last3[2])) {
      tag = 'deteriorating'
    } else if (last3.length === 3 && isMonotonicBetter(last3[0], last3[1], last3[2])) {
      tag = 'improving'
    } else if (directionChanges(history) >= 2) {
      tag = 'volatile'
    } else {
      const delta = computeSeasonDelta(history[history.length - 2], history[history.length - 1])
      tag = delta === 'new' ? 'stable' : delta
    }
  }

  const chronicStreak = tag === 'chronic' || tag === 'deteriorating'
    ? recentHistory.filter((h) => h.effectiveLevel !== 'green').length
    : undefined

  return {
    childKey,
    tag,
    currentLevel: latest?.effectiveLevel ?? 'green',
    previousLevel: history.length >= 2 ? history[history.length - 2].effectiveLevel : undefined,
    seasonCount,
    recentHistory,
    chronicStreakSeasons: chronicStreak,
    resolvedFdiCodes: [], // populated when FDI localization ships
    newFdiCodes: [],
    latestSeasonId: latest?.seasonId ?? '',
    latestCapturedAt,
  }
}

/**
 * Derive the longitudinal flag for a new finding by comparing it against
 * the prior season's findings for the same child.
 * Confidence delta alone does NOT indicate worsening — only class severity does.
 */
export const computeToothLongitudinal = (
  newFinding: { fdi?: number; className: FindingClass },
  priorFindings: { fdi?: number; className: FindingClass }[],
): LongitudinalFlag => {
  if (priorFindings.length === 0) return 'new'

  let match: { fdi?: number; className: FindingClass } | undefined

  if (newFinding.fdi != null) {
    // FDI-keyed: look for any prior finding at the same tooth regardless of class.
    // If no same-tooth prior exists, it's a genuinely new finding at that location.
    match = priorFindings.find((p) => p.fdi === newFinding.fdi)
    if (!match) return 'new'
  } else {
    // No FDI localization yet: compare against the most severe prior finding
    // (heuristic for "was there something worse/better before?").
    match = priorFindings.reduce<typeof priorFindings[0] | undefined>(
      (best, p) => !best || CLASS_SEVERITY[p.className] > CLASS_SEVERITY[best.className] ? p : best,
      undefined,
    )
  }

  if (!match) return 'new'

  const newSev = CLASS_SEVERITY[newFinding.className]
  const matchSev = CLASS_SEVERITY[match.className]
  if (newSev > matchSev) return 'worsened'
  if (newSev < matchSev) return 'resolved'
  return 'stable'
}

/** Compact trend for the mobile scan surface. */
export const toMobileChildTrend = (snap: ChildTrendSnapshot): MobileChildTrend => {
  const badge: MobileChildTrend['badge'] =
    snap.tag === 'first_season' || snap.tag === 'unscreened' ? 'first' :
    snap.tag === 'chronic' || snap.tag === 'deteriorating' ? 'chronic' :
    snap.tag === 'improved' || snap.tag === 'improving' ? 'better' :
    snap.tag === 'worsened' ? 'worse' : 'same'

  return {
    badge,
    badgeLabelMn: MOBILE_BADGE_MN[badge],
    seasonCount: snap.seasonCount,
    previousLevel: snap.previousLevel,
    currentLevel: snap.currentLevel,
  }
}
