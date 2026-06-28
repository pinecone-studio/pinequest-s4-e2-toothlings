/** MPU6050 DMP quaternion (normalized, w + xyz). */
export type DmpQuaternion = {
  w: number
  x: number
  y: number
  z: number
}

export type Mpu6050Vector3 = {
  x: number
  y: number
  z: number
}

/** Payload from ESP32 — mirrors I2Cdev DMP + raw register reads. */
export type Mpu6050Sample = {
  yaw: number
  pitch: number
  roll: number
  quaternion?: DmpQuaternion
  accel?: Mpu6050Vector3
  gyro?: Mpu6050Vector3
  at: number
}

export type Mpu6050EulerDeg = {
  yaw: number
  pitch: number
  roll: number
}
