import type { BoundingBox, FindingClass, SeasonId, TriageLevel } from './common.js'
import type { ChildKey } from './child.js'

/** A single normalized YOLO detection (camelCase contract). */
export interface InferenceDetection {
  classId: number
  className: FindingClass
  confidence: number
  box: BoundingBox
}

/** Raw inference output, pre-triage. Same shape from server or on-device. */
export interface InferenceResult {
  detections: InferenceDetection[]
  imageWidth: number
  imageHeight: number
  source: 'server' | 'on_device'
}

/** Longitudinal flag for a finding across seasons (child_key × season × FDI). */
export type LongitudinalFlag = 'new' | 'worsened' | 'stable' | 'resolved'

/** Child-level triage trajectory across seasons. */
export type ChildTrendTag =
  | 'first_season'   // only one season recorded
  | 'stable'         // no meaningful change
  | 'improved'       // last pair: level went down
  | 'worsened'       // last pair: level went up
  | 'improving'      // last 3: monotonically better
  | 'deteriorating'  // last 3: monotonically worse
  | 'chronic'        // last 3 all non-green
  | 'volatile'       // 2+ direction changes in history
  | 'unscreened'     // no screenings at all

export interface ChildSeasonEntry {
  seasonId: SeasonId
  effectiveLevel: TriageLevel
  triageScore: number
  gapFromPrior?: 'consecutive' | 'one_skip' | 'large_gap'
}

/** Pure-computed trend — derived in packages/core, never persisted. */
export interface ChildTrendSnapshot {
  childKey: string
  tag: ChildTrendTag
  currentLevel: TriageLevel
  previousLevel?: TriageLevel
  seasonCount: number
  /** Up to 5 most-recent seasons, ascending. */
  recentHistory: ChildSeasonEntry[]
  /** How many consecutive non-green seasons (for 'chronic'/'deteriorating'). */
  chronicStreakSeasons?: number
  /** FDI codes present last season but absent this season (empty until FDI ships). */
  resolvedFdiCodes: number[]
  /** FDI codes new this season (empty until FDI ships). */
  newFdiCodes: number[]
  latestSeasonId: SeasonId
  latestCapturedAt: string
}

/** Compact trend for the mobile scan surface — no clinical detail. */
export interface MobileChildTrend {
  badge: 'better' | 'worse' | 'same' | 'first' | 'chronic'
  /** Mongolian label for the badge. */
  badgeLabelMn: string
  seasonCount: number
  previousLevel?: TriageLevel
  currentLevel: TriageLevel
}

/** Per-tooth finding persisted with a screening (immutable). */
export interface ToothFinding {
  id: string
  /** FDI tooth code (11–48); optional until tooth localization exists. */
  fdi?: number
  className: FindingClass
  classId: number
  confidence: number
  box: BoundingBox
  longitudinal?: LongitudinalFlag
}

/** Screener symptom checklist captured at screening time. */
export interface SymptomSet {
  swelling?: boolean
  painDisturbingSleepOrEating?: boolean
  fever?: boolean
  gumPimpleOrFistula?: boolean
  trauma?: boolean
}

/** Derived triage outcome (computed in @pinequest/core, never by the model). */
export interface TriageResult {
  level: TriageLevel
  /** Continuous risk score that backs the discrete level. */
  score: number
  /** Whether the parent message may use definite (vs hedged) wording. */
  confidentWording: boolean
  reason?: string
}

/**
 * The immutable screening event. Self-contained and valid offline.
 * `id` is a client-generated UUID and doubles as the sync idempotency key.
 */
export interface Screening {
  id: string
  childKey: ChildKey
  classId: string
  schoolId: string
  seasonId: SeasonId
  screenedById: string
  /** Storage keys (synced) or local URIs (offline) for the captured photos. */
  imageRefs: string[]
  findings: ToothFinding[]
  symptoms: SymptomSet
  triage: TriageResult
  modelName: string
  modelVersion?: string
  /** Device wall-clock time of capture. */
  capturedAt: string
  deviceId?: string
  /** Server receipt time; null until synced up. */
  syncedAt: string | null
}

/** Payload a device sends to persist a screening (no PII — childKey only). */
export type ScreeningCreate = Omit<Screening, 'syncedAt'>

/** Expected dentition stage, derived from age (educational — NOT a per-tooth claim). */
export type DentitionStage = 'primary' | 'mixed' | 'permanent'

/**
 * Plain-language, dentist-safe screening summary for one child — built in
 * @pinequest/core. SCREENING signals only, never a diagnosis: counts are
 * "areas flagged for a dentist to check", copy is hedged + pinned to a content
 * version. No banned clinical words (decay/caries/cavity) reach this object.
 */
export interface ChildScreeningSummary {
  screeningId: string
  seasonId: SeasonId
  capturedAt: string
  /** AI triage level. */
  aiLevel: TriageLevel
  /** Dentist-confirmed level, if a review exists. */
  reviewedLevel?: TriageLevel
  /** What the UI should color by: reviewedLevel ?? aiLevel. */
  effectiveLevel: TriageLevel
  /** Definite vs hedged wording allowed (high model confidence). */
  confidentWording: boolean
  /** Count of image areas a dentist should check (NOT a decay count). */
  flaggedAreas: number
  /** Split of flagged areas by model confidence. */
  flaggedByConfidence: { high: number; moderate: number; low: number }
  /** FDI codes of localized findings (empty until localization exists). */
  loci: number[]
  /** Reported danger-sign symptom keys present (from the questionnaire). */
  symptoms: string[]
  /** Age in years at capture (from birth year). */
  ageYears: number
  /** Expected dentition stage for that age. */
  dentitionStage: DentitionStage
  /** Hedged, compliant one-line result statement. */
  headline: string
  /** Versioned, age-aware "what to do at home" steps. */
  homeSteps: string[]
}
