import type { BrushZone } from '@/lib/consumerState'
import type { BrushSensorFrame, ToothSurface } from '@/lib/brushMl'
import {
  ESP32_MPU6050_LOOP,
  parseMpu6050Payload,
  type Mpu6050Sample,
} from '@/lib/mpu6050'

const ESP32_WS_FALLBACK = 'ws://172.27.221.251:81'

export const DEFAULT_ESP32_WS_URL =
  process.env.NEXT_PUBLIC_ESP32_WS_URL?.trim() || ESP32_WS_FALLBACK

export const isValidEsp32WsUrl = (url: string): boolean =>
  /^wss?:\/\/[^\s/]+(:\d+)?/.test(url.trim())

export type ImuQuaternion = {
  w: number
  x: number
  y: number
  z: number
}

export type ImuReading = Mpu6050Sample

export const parseImuPayload = parseMpu6050Payload

export const ESP32_QUATERNION_SNIPPET = ESP32_MPU6050_LOOP

const ZONE_LABELS: Record<BrushZone, string> = {
  UL: 'Дээд зүүн',
  UR: 'Дээд баруун',
  LL: 'Доод зүүн',
  LR: 'Доод баруун',
}

export const zoneLabel = (zone: BrushZone): string => ZONE_LABELS[zone]

export const inferZoneFromImu = (imu: ImuReading): BrushZone => {
  const left = imu.yaw < -8 || imu.roll < -8
  const upper = imu.pitch > 12
  const lower = imu.pitch < -12
  if (upper) return left ? 'UL' : 'UR'
  if (lower) return left ? 'LL' : 'LR'
  return imu.pitch >= 0 ? (left ? 'UL' : 'UR') : left ? 'LL' : 'LR'
}

export const inferSurfaceFromImu = (imu: ImuReading): ToothSurface => {
  if (Math.abs(imu.pitch) < 12 && Math.abs(imu.roll) < 12) return 'occlusal'
  if (imu.roll > 15) return 'inner'
  return 'outer'
}

export const imuToSensorFrame = (imu: ImuReading): BrushSensorFrame => ({
  timestamp: imu.at,
  zone: inferZoneFromImu(imu),
  surface: inferSurfaceFromImu(imu),
  pressure: 0.62,
  tiltDeg: imu.roll,
})
