/**
 * InvenSense DMP helpers — ported from Jeff Rowberg i2cdevlib (MPU6050_6Axis_MotionApps20).
 * @see https://github.com/jrowberg/i2cdevlib/tree/master/Arduino/MPU6050
 */

import type { DmpQuaternion, Mpu6050EulerDeg, Mpu6050Vector3 } from './types'

/** DMP quaternion fixed-point scale (Q30). */
export const DMP_QUAT_SCALE = 1073741824

const RAD2DEG = 180 / Math.PI

export const normalizeDmpQuaternion = (q: DmpQuaternion): DmpQuaternion => {
  const len = Math.hypot(q.w, q.x, q.y, q.z)
  if (len < 1e-8) return { w: 1, x: 0, y: 0, z: 0 }
  return { w: q.w / len, x: q.x / len, y: q.y / len, z: q.z / len }
}

/** Parse Q30 int or float quaternion from WebSocket JSON. */
export const parseDmpQuaternion = (data: Record<string, unknown>): DmpQuaternion | undefined => {
  const w = Number(data.qw ?? data.w)
  const x = Number(data.qx ?? data.x)
  const y = Number(data.qy ?? data.y)
  const z = Number(data.qz ?? data.z)
  if (![w, x, y, z].every(Number.isFinite)) return undefined

  const maxAbs = Math.max(Math.abs(w), Math.abs(x), Math.abs(y), Math.abs(z))
  const q =
    maxAbs > 2
      ? {
          w: w / DMP_QUAT_SCALE,
          x: x / DMP_QUAT_SCALE,
          y: y / DMP_QUAT_SCALE,
          z: z / DMP_QUAT_SCALE,
        }
      : { w, x, y, z }

  return normalizeDmpQuaternion(q)
}

/** `mpu.dmpGetGravity(&gravity, &q)` */
export const dmpGetGravity = (q: DmpQuaternion): Mpu6050Vector3 => ({
  x: 2 * (q.x * q.z - q.w * q.y),
  y: 2 * (q.w * q.x + q.y * q.z),
  z: q.w * q.w - q.x * q.x - q.y * q.y + q.z * q.z,
})

/** `mpu.dmpGetYawPitchRoll(ypr, &q, &gravity)` — radians internally, degrees out. */
export const dmpGetYawPitchRoll = (q: DmpQuaternion, gravity?: Mpu6050Vector3): Mpu6050EulerDeg => {
  const g = gravity ?? dmpGetGravity(q)
  const yaw = Math.atan2(2 * q.x * q.y - 2 * q.w * q.z, 2 * q.w * q.w + 2 * q.x * q.x - 1)
  const pitch = Math.atan2(g.x, Math.sqrt(g.y * g.y + g.z * g.z))
  const roll = Math.atan2(g.y, g.z)
  return { yaw: yaw * RAD2DEG, pitch: pitch * RAD2DEG, roll: roll * RAD2DEG }
}
