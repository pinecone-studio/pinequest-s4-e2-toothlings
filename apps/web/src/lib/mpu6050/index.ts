export type { DmpQuaternion, Mpu6050EulerDeg, Mpu6050Sample, Mpu6050Vector3 } from './types'
export { DMP_QUAT_SCALE, dmpGetGravity, dmpGetYawPitchRoll, normalizeDmpQuaternion, parseDmpQuaternion } from './dmp'
export { parseMpu6050Payload } from './parse'
export { Mpu6050Tracker } from './tracker'

/** ESP32 loop() — DMP quaternion + raw accel/gyro (I2Cdevlib). */
export const ESP32_MPU6050_LOOP = `if (mpu.dmpGetCurrentFIFOPacket(fifoBuffer)) {
  mpu.dmpGetQuaternion(&q, fifoBuffer);
  mpu.dmpGetGravity(&gravity, &q);
  mpu.dmpGetYawPitchRoll(ypr, &q, &gravity);

  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  float yaw   = ypr[0] * 180.0 / M_PI;
  float pitch = ypr[1] * 180.0 / M_PI;
  float roll  = ypr[2] * 180.0 / M_PI;

  #define Q30 1073741824.0f
  float qw = q.w / Q30, qx = q.x / Q30, qy = q.y / Q30, qz = q.z / Q30;
  float fax = ax / 16384.0f, fay = ay / 16384.0f, faz = az / 16384.0f;
  float fgx = gx / 16.4f,    fgy = gy / 16.4f,    fgz = gz / 16.4f;

  String json = "{\\"y\\":" + String(yaw,2) + ",\\"p\\":" + String(pitch,2) + ",\\"r\\":" + String(roll,2)
    + ",\\"qw\\":" + String(qw,4) + ",\\"qx\\":" + String(qx,4)
    + ",\\"qy\\":" + String(qy,4) + ",\\"qz\\":" + String(qz,4)
    + ",\\"ax\\":" + String(fax,3) + ",\\"ay\\":" + String(fay,3) + ",\\"az\\":" + String(faz,3)
    + ",\\"gx\\":" + String(fgx,2) + ",\\"gy\\":" + String(fgy,2) + ",\\"gz\\":" + String(fgz,2) + "}";
  webSocket.broadcastTXT(json);
}`
