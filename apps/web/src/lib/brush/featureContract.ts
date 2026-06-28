/**
 * IMU FEATURE CONTRACT — SINGLE SOURCE OF TRUTH (mirror in training/features.py).
 *
 * Per-frame feature vector fed to the temporal model. Both the browser (live)
 * and Python (training) MUST compute the EXACT same numbers, or the model sees
 * a different distribution at inference time. If you change FEATURE_DIM or the
 * math here, change features.py in lockstep and retrain.
 *
 * Frame layout (FEATURE_DIM = 11), all roughly in [-1, 1]:
 *   [0..2]  gravity unit vector in sensor frame   (drift-free pitch/roll)
 *   [3..5]  gyro   (deg/s)      / GYRO_SCALE       (scrubbing / motion)
 *   [6..8]  linear accel (g)    / ACCEL_SCALE      (lateral motion, gravity removed)
 *   [9]     sin(relative yaw)                      (left/right vs calibration)
 *   [10]    cos(relative yaw)
 *
 * Pure functions only — NO platform imports — so mobile can reuse this verbatim.
 */

export const FEATURE_DIM = 11

export const GYRO_SCALE = 250 // deg/s → ~[-1,1] for normal brushing
export const ACCEL_SCALE = 2 // g

export type Quat = { w: number; x: number; y: number; z: number }
export type Vec3 = { x: number; y: number; z: number }

/** Minimal IMU sample the contract needs. Compatible with Mpu6050Sample. */
export type ImuFrameInput = {
  quaternion?: { w: number; x: number; y: number; z: number }
  yaw: number
  pitch: number
  roll: number
  gyro?: Vec3
  accel?: Vec3
}

const DEG2RAD = Math.PI / 180

export const normalizeQuat = (q: Quat): Quat => {
  const len = Math.hypot(q.w, q.x, q.y, q.z)
  if (len < 1e-8) return { w: 1, x: 0, y: 0, z: 0 }
  const s = q.w < 0 ? -1 / len : 1 / len // canonical w >= 0
  return { w: q.w * s, x: q.x * s, y: q.y * s, z: q.z * s }
}

/** Hamilton product a ⊗ b. */
export const quatMul = (a: Quat, b: Quat): Quat => ({
  w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
  y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
  z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
})

export const quatConjugate = (q: Quat): Quat => ({ w: q.w, x: -q.x, y: -q.y, z: -q.z })

export const IDENTITY_QUAT: Quat = { w: 1, x: 0, y: 0, z: 0 }

/** Yaw/pitch/roll (deg, ZYX) → quaternion. Fallback when DMP quaternion absent. */
export const yprToQuat = (yawDeg: number, pitchDeg: number, rollDeg: number): Quat => {
  const cy = Math.cos((yawDeg * DEG2RAD) / 2)
  const sy = Math.sin((yawDeg * DEG2RAD) / 2)
  const cp = Math.cos((pitchDeg * DEG2RAD) / 2)
  const sp = Math.sin((pitchDeg * DEG2RAD) / 2)
  const cr = Math.cos((rollDeg * DEG2RAD) / 2)
  const sr = Math.sin((rollDeg * DEG2RAD) / 2)
  return normalizeQuat({
    w: cr * cp * cy + sr * sp * sy,
    x: sr * cp * cy - cr * sp * sy,
    y: cr * sp * cy + sr * cp * sy,
    z: cr * cp * sy - sr * sp * cy,
  })
}

/** Gravity in the sensor frame — matches i2cdevlib dmpGetGravity. Unit length. */
export const gravityFromQuat = (q: Quat): Vec3 => ({
  x: 2 * (q.x * q.z - q.w * q.y),
  y: 2 * (q.w * q.x + q.y * q.z),
  z: q.w * q.w - q.x * q.x - q.y * q.y + q.z * q.z,
})

/** Yaw (rad) of a quaternion (ZYX convention). */
export const yawOfQuat = (q: Quat): number =>
  Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z))

export const quatFromInput = (s: ImuFrameInput): Quat => {
  if (s.quaternion) return normalizeQuat(s.quaternion)
  return yprToQuat(s.yaw, s.pitch, s.roll)
}

const clamp1 = (v: number): number => (v > 1 ? 1 : v < -1 ? -1 : v)

/**
 * Build the per-frame feature vector. `refQuat` is the calibration orientation
 * (set by the user pressing "Тэгшлэх"); pass IDENTITY_QUAT for absolute mode.
 */
export const extractFrameFeatures = (s: ImuFrameInput, refQuat: Quat = IDENTITY_QUAT): number[] => {
  const q = quatFromInput(s)
  const grav = gravityFromQuat(q)

  const gyro = s.gyro ?? { x: 0, y: 0, z: 0 }
  const accel = s.accel ?? grav // if no accel, gravity is the only info
  const linAccel = { x: accel.x - grav.x, y: accel.y - grav.y, z: accel.z - grav.z }

  const rel = quatMul(quatConjugate(refQuat), q)
  const relYaw = yawOfQuat(rel)

  return [
    grav.x,
    grav.y,
    grav.z,
    clamp1(gyro.x / GYRO_SCALE),
    clamp1(gyro.y / GYRO_SCALE),
    clamp1(gyro.z / GYRO_SCALE),
    clamp1(linAccel.x / ACCEL_SCALE),
    clamp1(linAccel.y / ACCEL_SCALE),
    clamp1(linAccel.z / ACCEL_SCALE),
    Math.sin(relYaw),
    Math.cos(relYaw),
  ]
}

/** Scrubbing intensity (deg/s magnitude) — drives the motion-gated coverage. */
export const gyroMagnitude = (s: ImuFrameInput): number => {
  const g = s.gyro
  if (!g) return 0
  return Math.hypot(g.x, g.y, g.z)
}

/** Linear-accel magnitude (g) — secondary motion signal. */
export const linAccelMagnitude = (s: ImuFrameInput): number => {
  if (!s.accel) return 0
  const q = quatFromInput(s)
  const grav = gravityFromQuat(q)
  return Math.hypot(s.accel.x - grav.x, s.accel.y - grav.y, s.accel.z - grav.z)
}
