/**
 * Orientation heuristic — a deterministic zone classifier used as a FALLBACK
 * before any model is trained, and as a sanity baseline. The trained TFJS model
 * (when present) supersedes this. Keep it simple and explainable.
 */

import {
  quatConjugate,
  quatFromInput,
  quatMul,
  yawOfQuat,
  type ImuFrameInput,
  type Quat,
} from './featureContract'
import { IDENTITY_QUAT } from './featureContract'
import { IDLE_LABEL, type BrushLabel, type BrushSurface } from './zones'
import { LIVE_IDLE_MAX_GYRO } from './config'

const RAD2DEG = 180 / Math.PI

const relativeYawDeg = (s: ImuFrameInput, ref: Quat): number => {
  const q = quatFromInput(s)
  const rel = quatMul(quatConjugate(ref), q)
  return yawOfQuat(rel) * RAD2DEG
}

const surfaceFromRoll = (rollDeg: number): BrushSurface => {
  const r = Math.abs(rollDeg)
  if (r < 35) return 'occlusal' // brush laid flat on the chewing surface
  if (rollDeg > 0) return 'outer'
  return 'inner'
}

export const classifyHeuristic = (
  s: ImuFrameInput,
  refQuat: Quat = IDENTITY_QUAT,
  gyroMag = 0,
): BrushLabel => {
  if (gyroMag > 0 && gyroMag < LIVE_IDLE_MAX_GYRO) return IDLE_LABEL

  const upper = s.pitch >= 0
  const left = relativeYawDeg(s, refQuat) <= 0
  const quadrant = upper ? (left ? 'UL' : 'UR') : left ? 'LL' : 'LR'
  const surface = surfaceFromRoll(s.roll)
  return `${quadrant}-${surface}` as BrushLabel
}
