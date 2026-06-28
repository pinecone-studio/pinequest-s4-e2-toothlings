import { parseDmpQuaternion } from './dmp'
import type { Mpu6050Sample, Mpu6050Vector3 } from './types'

const vec3 = (data: Record<string, unknown>, prefix: string): Mpu6050Vector3 | undefined => {
  const x = Number(data[`${prefix}x`] ?? data[`${prefix}X`])
  const y = Number(data[`${prefix}y`] ?? data[`${prefix}Y`])
  const z = Number(data[`${prefix}z`] ?? data[`${prefix}Z`])
  if (![x, y, z].every(Number.isFinite)) return undefined
  return { x, y, z }
}

/** Parse ESP32 WebSocket JSON into an MPU6050 sample. */
export const parseMpu6050Payload = (raw: string): Mpu6050Sample | null => {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>
    const yaw = Number(data.y ?? data.yaw)
    const pitch = Number(data.p ?? data.pitch)
    const roll = Number(data.r ?? data.roll)
    if (![yaw, pitch, roll].every(Number.isFinite)) return null

    return {
      yaw,
      pitch,
      roll,
      quaternion: parseDmpQuaternion(data),
      accel: vec3(data, 'a'),
      gyro: vec3(data, 'g'),
      at: Date.now(),
    }
  } catch {
    return null
  }
}
