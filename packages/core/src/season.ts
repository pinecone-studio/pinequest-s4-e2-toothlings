import type { SeasonId } from '@pinequest/types'

/**
 * Screening runs at least once per school term. Summer (Jun–Aug) is a break and is
 * NEVER screened, so a season is one of three terms keyed by calendar year:
 * `"{year}-{term}"` (e.g. "2026-fall"), matching the season ids already in the data.
 */
export type SeasonTerm = 'fall' | 'winter' | 'spring'

export const SCREENING_TERMS: readonly SeasonTerm[] = ['fall', 'winter', 'spring']

const TERM_LABEL_MN: Record<SeasonTerm, string> = {
  fall: 'Намар',
  winter: 'Өвөл',
  spring: 'Хавар',
}

/** Calendar month (1–12) → term; Jun–Aug (summer break) resolve to the upcoming fall. */
const termForMonth = (month: number): SeasonTerm => {
  if (month >= 9 && month <= 11) return 'fall'
  if (month === 12 || month <= 2) return 'winter'
  if (month >= 3 && month <= 5) return 'spring'
  return 'fall' // summer break — next screening is the fall term
}

/** Map a date to its season id; summer dates fall through to that year's fall term. */
export const seasonForDate = (date: Date): SeasonId =>
  `${date.getFullYear()}-${termForMonth(date.getMonth() + 1)}`

/** The three screenable seasons of a calendar year, ordered fall → winter → spring. */
export const seasonsForYear = (year: number): SeasonId[] =>
  SCREENING_TERMS.map((term) => `${year}-${term}`)

export const parseSeason = (seasonId: SeasonId): { year: string; term?: SeasonTerm } => {
  const [year, term] = seasonId.split('-')
  return { year, term: SCREENING_TERMS.includes(term as SeasonTerm) ? (term as SeasonTerm) : undefined }
}

/** Mongolian label, e.g. "2026 Намар"; unrecognised ids pass through unchanged. */
export const seasonLabelMn = (seasonId: SeasonId): string => {
  const { year, term } = parseSeason(seasonId)
  return term ? `${year} ${TERM_LABEL_MN[term]}` : seasonId
}

const TERM_ORDINAL: Record<SeasonTerm, number> = { fall: 0, winter: 1, spring: 2 }

/**
 * Total ordering across all seasons: year × 3 + term index.
 * e.g. 2026-fall=6078, 2026-winter=6079, 2026-spring=6080, 2027-fall=6081.
 * Unrecognised ids return NaN.
 */
export const seasonOrdinal = (seasonId: SeasonId): number => {
  const { year, term } = parseSeason(seasonId)
  if (!term) return NaN
  return Number(year) * 3 + TERM_ORDINAL[term]
}

export type SeasonGap = 'consecutive' | 'one_skip' | 'large_gap'

/** How many screening opportunities were missed between two season ids. */
export const gapBetween = (prev: SeasonId, curr: SeasonId): SeasonGap => {
  const d = seasonOrdinal(curr) - seasonOrdinal(prev)
  if (d <= 1) return 'consecutive'
  if (d === 2) return 'one_skip'
  return 'large_gap'
}
