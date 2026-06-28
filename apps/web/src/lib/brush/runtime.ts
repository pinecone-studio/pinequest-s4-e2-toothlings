'use client'

/**
 * Live brushing recognizer. Loads the TFJS model exported by training/train.py
 * and runs a sliding window over the IMU stream. Falls back to the orientation
 * heuristic when no model is deployed yet, so the page is useful from day one.
 *
 * Window/feature math MUST mirror training/dataset.py + features.py.
 */

import * as tf from '@tensorflow/tfjs'
import {
  extractFrameFeatures,
  gyroMagnitude,
  IDENTITY_QUAT,
  quatFromInput,
  type ImuFrameInput,
  type Quat,
} from './featureContract'
import { FEATURE_DIM } from './featureContract'
import {
  LIVE_STRIDE,
  METADATA_URL,
  MODEL_JSON_URL,
  SEQ_LEN,
} from './config'
import { classifyHeuristic } from './heuristic'
import { BRUSH_LABELS, IDLE_LABEL, type BrushLabel } from './zones'

const WINDOW_SEC = 1.3 // must equal training/config.WINDOW_SEC

export type BrushMetadata = {
  labels: string[]
  seqLen: number
  featureDim: number
  windowSec?: number
  minLiveConfidence?: number
  minStreak?: number
}

export type BrushPrediction = {
  label: string
  confidence: number
  margin: number
  gyroMag: number
  source: 'model' | 'heuristic'
}

export type LoadResult =
  | { ok: true; model: tf.LayersModel; meta: BrushMetadata }
  | { ok: false; reason: 'missing_files' | 'feature_mismatch' | 'load_error'; detail?: unknown }

export const loadBrushModel = async (): Promise<LoadResult> => {
  let meta: BrushMetadata
  try {
    const res = await fetch(METADATA_URL, { cache: 'no-store' })
    if (!res.ok) return { ok: false, reason: 'missing_files' }
    meta = (await res.json()) as BrushMetadata
  } catch (detail) {
    return { ok: false, reason: 'missing_files', detail }
  }

  if (meta.featureDim !== FEATURE_DIM || meta.seqLen !== SEQ_LEN) {
    return { ok: false, reason: 'feature_mismatch' }
  }

  try {
    const model = await tf.loadLayersModel(MODEL_JSON_URL)
    return { ok: true, model, meta }
  } catch (detail) {
    return { ok: false, reason: 'load_error', detail }
  }
}

type TimedSample = { t: number; s: ImuFrameInput }

/** Linear-interpolate a (rows × FEATURE_DIM) buffer in time to SEQ_LEN rows. */
const resampleFeatures = (rows: number[][], times: number[], target: number): number[][] => {
  const n = rows.length
  if (n === 0) return Array.from({ length: target }, () => new Array(FEATURE_DIM).fill(0))
  if (n === 1) return Array.from({ length: target }, () => rows[0].slice())

  const t0 = times[0]
  const t1 = times[n - 1]
  const span = t1 - t0 || 1
  const out: number[][] = []
  for (let i = 0; i < target; i++) {
    const tt = t0 + (span * i) / (target - 1)
    // find bracketing indices
    let hi = 1
    while (hi < n - 1 && times[hi] < tt) hi++
    const lo = hi - 1
    const denom = times[hi] - times[lo] || 1
    const f = Math.max(0, Math.min(1, (tt - times[lo]) / denom))
    const row = new Array(FEATURE_DIM)
    for (let d = 0; d < FEATURE_DIM; d++) {
      row[d] = rows[lo][d] * (1 - f) + rows[hi][d] * f
    }
    out.push(row)
  }
  return out
}

export class BrushRecognizer {
  private buffer: TimedSample[] = []
  private refQuat: Quat = IDENTITY_QUAT
  private frameCount = 0
  private readonly windowMs = WINDOW_SEC * 1000

  constructor(
    private readonly model: tf.LayersModel | null,
    private readonly meta: BrushMetadata | null,
  ) {}

  /** Set calibration ("Тэгшлэх") — current orientation becomes yaw=0 reference. */
  calibrate(sample: ImuFrameInput | null): void {
    this.refQuat = sample ? quatFromInput(sample) : IDENTITY_QUAT
    this.buffer = []
  }

  get usingModel(): boolean {
    return this.model !== null && this.meta !== null
  }

  /** Push one IMU sample (timestamp ms). Returns a prediction on stride frames. */
  push(sample: ImuFrameInput, t: number): BrushPrediction | null {
    this.buffer.push({ t, s: sample })
    const cutoff = t - this.windowMs
    while (this.buffer.length > 1 && this.buffer[0].t < cutoff) this.buffer.shift()

    this.frameCount += 1
    if (this.frameCount % LIVE_STRIDE !== 0) return null

    const gyroMag = gyroMagnitude(sample)

    if (!this.usingModel) {
      const label = classifyHeuristic(sample, this.refQuat, gyroMag)
      return { label, confidence: 1, margin: 1, gyroMag, source: 'heuristic' }
    }
    return this.predictModel(gyroMag)
  }

  private predictModel(gyroMag: number): BrushPrediction {
    const model = this.model as tf.LayersModel
    const labels = this.meta?.labels ?? BRUSH_LABELS
    const times = this.buffer.map((b) => b.t)
    const rows = this.buffer.map((b) => extractFrameFeatures(b.s, this.refQuat))
    const win = resampleFeatures(rows, times, SEQ_LEN)

    const probs = tf.tidy(() => {
      const input = tf.tensor3d([win], [1, SEQ_LEN, FEATURE_DIM])
      const out = model.predict(input) as tf.Tensor
      return out.dataSync()
    })

    let best = 0
    let second = 0
    for (let i = 1; i < probs.length; i++) {
      if (probs[i] > probs[best]) {
        second = best
        best = i
      } else if (probs[i] > probs[second]) {
        second = i
      }
    }
    const label = labels[best] ?? IDLE_LABEL
    const confidence = probs[best]
    const margin = confidence - (probs[second] ?? 0)
    return { label: label as BrushLabel, confidence, margin, gyroMag, source: 'model' }
  }

  warmup(): void {
    if (!this.usingModel) return
    const model = this.model as tf.LayersModel
    tf.tidy(() => {
      const z = tf.zeros([1, SEQ_LEN, FEATURE_DIM])
      const out = model.predict(z) as tf.Tensor
      out.dataSync()
    })
  }

  dispose(): void {
    this.model?.dispose()
  }
}

/**
 * Streak-based emitter — smooths noisy per-frame predictions into a stable
 * "current zone" the UI shows. A label must win `minStreak` predictions in a
 * row above `minConfidence` to become active.
 */
export class BrushEmitter {
  private last: string | null = null
  private streak = 0

  constructor(
    private readonly minConfidence: number,
    private readonly minStreak: number,
  ) {}

  push(pred: BrushPrediction): string | null {
    if (pred.label === IDLE_LABEL || pred.confidence < this.minConfidence) {
      this.streak = 0
      this.last = pred.label
      return pred.label === IDLE_LABEL ? IDLE_LABEL : null
    }
    if (pred.label === this.last) {
      this.streak += 1
    } else {
      this.last = pred.label
      this.streak = 1
    }
    return this.streak >= this.minStreak ? pred.label : null
  }
}
