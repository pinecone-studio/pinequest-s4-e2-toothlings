/**
 * Runtime constants for live inference (mirror of training/config.py).
 * The authoritative copy for TRAINING lives in training/config.py;
 * the exported metadata.json carries seqLen/featureDim so the web client can
 * detect a mismatch and refuse to run a stale model.
 */

/** Sensor stream rate the ESP32 broadcasts at (firmware: SEND_HZ). */
export const STREAM_HZ = 50

/** Frames per model window. ~1.28s of context at 25Hz resample. */
export const SEQ_LEN = 32

/** Window is resampled to SEQ_LEN; we keep a raw ring buffer this long. */
export const LIVE_BUFFER_FRAMES = 64

/** Run inference every N incoming frames (50Hz / 5 = 10 predictions/sec). */
export const LIVE_STRIDE = 5

/** Recording: one labelled clip is this long. */
export const CLIP_SECONDS = 2.0

/** Live emitter thresholds (overridable by metadata.json). */
export const LIVE_MIN_CONFIDENCE = 0.6
export const LIVE_MIN_STREAK = 2
export const LIVE_IDLE_MAX_GYRO = 12 // deg/s — below this = idle regardless of model

/** Coverage model: a zone is "done" at this many effective brushing seconds. */
export const ZONE_TARGET_SECONDS = 20
export const SESSION_TARGET_SECONDS = 120

/** Motion gate: scrubbing must exceed this to accrue coverage. */
export const COVERAGE_MIN_GYRO = 25 // deg/s
export const COVERAGE_FULL_GYRO = 220 // deg/s → full-rate credit

export const MODEL_DIR = '/models/brush'
export const MODEL_JSON_URL = `${MODEL_DIR}/model.json`
export const METADATA_URL = `${MODEL_DIR}/metadata.json`
