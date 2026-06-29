/**
 * Coverage scorer — turns a stream of (predicted zone + scrubbing intensity)
 * into per-zone progress. Motion-gated: holding the brush still in a zone does
 * NOT accrue coverage; you must actually scrub. (No pressure sensor yet, so
 * gyro magnitude is the proxy — see config.COVERAGE_* and ZONE_TARGET_SECONDS.)
 *
 * Pure + serializable so it can persist to a session and later sync.
 */

import {
  COVERAGE_FULL_GYRO,
  COVERAGE_MIN_GYRO,
  ZONE_TARGET_SECONDS,
} from './config'
import {
  BRUSH_LABELS,
  IDLE_LABEL,
  parseBrushLabel,
  QUADRANTS,
  SURFACES,
  type BrushLabel,
  type BrushQuadrant,
  type BrushSurface,
} from './zones'

export type ZoneKey = Exclude<BrushLabel, typeof IDLE_LABEL>

/** Effective brushing seconds accrued per zone (12 zones). */
export type CoverageMap = Record<string, number>

export type CoverageState = {
  /** seconds of effective scrubbing per zone key (e.g. "UL-outer"). */
  seconds: CoverageMap
  activeZone: ZoneKey | null
  lastUpdate: number
}

export const ZONE_KEYS: ZoneKey[] = BRUSH_LABELS.filter(
  (l): l is ZoneKey => l !== IDLE_LABEL,
)

export const createCoverageState = (saved?: CoverageMap): CoverageState => ({
  seconds: { ...zeroMap(), ...(saved ?? {}) },
  activeZone: null,
  lastUpdate: 0,
})

const zeroMap = (): CoverageMap =>
  Object.fromEntries(ZONE_KEYS.map((k) => [k, 0])) as CoverageMap

/** Map scrubbing intensity (deg/s) to a [0..1] credit multiplier. */
export const motionCredit = (gyroMag: number): number => {
  if (gyroMag < COVERAGE_MIN_GYRO) return 0
  if (gyroMag >= COVERAGE_FULL_GYRO) return 1
  return (gyroMag - COVERAGE_MIN_GYRO) / (COVERAGE_FULL_GYRO - COVERAGE_MIN_GYRO)
}

/**
 * Advance coverage by `dtSec` given the current predicted label and scrubbing.
 * Returns a new state (immutably) so React can diff cheaply.
 */
export const advanceCoverage = (
  state: CoverageState,
  label: string,
  gyroMag: number,
  dtSec: number,
  now: number,
): CoverageState => {
  const parsed = parseBrushLabel(label)
  if (!parsed || dtSec <= 0 || dtSec > 1) {
    return { ...state, activeZone: parsed ? (label as ZoneKey) : null, lastUpdate: now }
  }
  const credit = motionCredit(gyroMag)
  if (credit <= 0) {
    return { ...state, activeZone: label as ZoneKey, lastUpdate: now }
  }
  const key = label as ZoneKey
  const next = { ...state.seconds }
  next[key] = (next[key] ?? 0) + dtSec * credit
  return { seconds: next, activeZone: key, lastUpdate: now }
}

export const zoneProgress = (state: CoverageState, key: ZoneKey): number =>
  Math.min(1, (state.seconds[key] ?? 0) / ZONE_TARGET_SECONDS)

export const quadrantProgress = (state: CoverageState, q: BrushQuadrant): number => {
  const vals = SURFACES.map((s) => zoneProgress(state, `${q}-${s}` as ZoneKey))
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export const surfaceProgress = (state: CoverageState, q: BrushQuadrant, s: BrushSurface): number =>
  zoneProgress(state, `${q}-${s}` as ZoneKey)

export const overallProgress = (state: CoverageState): number => {
  const vals = ZONE_KEYS.map((k) => zoneProgress(state, k))
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100)
}

export type ZoneStatus = 'clean' | 'partial' | 'missed'

export const zoneStatus = (progress: number): ZoneStatus => {
  if (progress >= 0.75) return 'clean'
  if (progress >= 0.25) return 'partial'
  return 'missed'
}

export const missedZones = (state: CoverageState): ZoneKey[] =>
  ZONE_KEYS.filter((k) => zoneStatus(zoneProgress(state, k)) === 'missed')

export const totalBrushSeconds = (state: CoverageState): number =>
  Object.values(state.seconds).reduce((a, b) => a + b, 0)

export const quadrantSummary = (
  state: CoverageState,
): { quadrant: BrushQuadrant; progress: number }[] =>
  QUADRANTS.map((q) => ({ quadrant: q, progress: quadrantProgress(state, q) }))
