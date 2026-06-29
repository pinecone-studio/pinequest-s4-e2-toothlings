/*
 * Screener Smart Brush — ESP32 + MPU6050 (DMP) → WebSocket streamer.
 *
 * Streams, at SEND_HZ, ONE JSON object per packet with everything the web ML
 * pipeline needs. Field names MUST match apps/web/src/lib/mpu6050/parse.ts:
 *
 *   y,p,r              yaw/pitch/roll (deg, DMP fused)
 *   qw,qx,qy,qz        DMP quaternion (full 360°, no gimbal lock)
 *   ax,ay,az           accel (g)        — gravity + linear
 *   gx,gy,gz           gyro  (deg/s)    — scrubbing intensity
 *
 * Libraries (Arduino Library Manager):
 *   - "MPU6050" by Electronic Cats (i2cdevlib)  → MPU6050_6Axis_MotionApps20.h
 *   - "WebSockets" by Markus Sattler            → WebSocketsServer.h
 *
 * Board: ESP32 Dev Module. Wiring (this sketch): SDA=GPIO5, SCL=GPIO6.
 */

#include "I2Cdev.h"
#include "MPU6050_6Axis_MotionApps20.h"
#include <WiFi.h>
#include <WebSocketsServer.h>

#if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
  #include "Wire.h"
#endif

// ----------------------------------------------------------------- CONFIG
const char* WIFI_SSID = "Redmi 13c";
const char* WIFI_PASS = "negees naim";

const uint8_t  PIN_SDA = 5;
const uint8_t  PIN_SCL = 6;
const uint16_t WS_PORT = 81;
const uint16_t SEND_HZ = 50;            // stream rate (web config.STREAM_HZ)
const uint32_t SEND_INTERVAL_MS = 1000 / SEND_HZ;

// Accel / gyro full-scale → physical units (default DMP: ±2g, ±2000°/s).
const float ACCEL_LSB_PER_G   = 16384.0f;   // ±2g
const float GYRO_LSB_PER_DPS  = 16.4f;      // ±2000°/s
const float Q30 = 1073741824.0f;            // DMP quaternion fixed-point

// ----------------------------------------------------------------- STATE
MPU6050 mpu;
WebSocketsServer webSocket = WebSocketsServer(WS_PORT);

bool dmpReady = false;
uint8_t devStatus;
uint16_t packetSize;
uint8_t fifoBuffer[64];

Quaternion q;
VectorFloat gravity;
float ypr[3];

uint32_t lastSendMs = 0;
char payload[256];

// ----------------------------------------------------------------- WIFI
void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("WiFi холбогдож байна");
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("ESP32 IP хаяг: ");
  Serial.println(WiFi.localIP());
  Serial.printf("→ Web: ws://%s:%u\n", WiFi.localIP().toString().c_str(), WS_PORT);
}

// ----------------------------------------------------------------- IMU
void initIMU() {
#if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.setClock(400000);
#endif
  mpu.initialize();
  Serial.println(mpu.testConnection() ? "MPU6050 OK" : "MPU6050 холболтын алдаа");

  devStatus = mpu.dmpInitialize();

  // Calibrated offsets — replace with values from IMU_Zero/CalibrateMPU6050.
  mpu.setXGyroOffset(220);
  mpu.setYGyroOffset(76);
  mpu.setZGyroOffset(-85);
  mpu.setZAccelOffset(1788);

  if (devStatus == 0) {
    // Auto-calibration (~recommended by i2cdevlib) for cleaner data:
    mpu.CalibrateAccel(6);
    mpu.CalibrateGyro(6);
    mpu.setDMPEnabled(true);
    packetSize = mpu.dmpGetFIFOPacketSize();
    dmpReady = true;
    Serial.println("DMP идэвхжлээ");
  } else {
    Serial.printf("DMP алдаа: %d\n", devStatus);
  }
}

void onWsEvent(uint8_t num, WStype_t type, uint8_t* payloadData, size_t length) {
  if (type == WStype_CONNECTED) {
    Serial.printf("[%u] Web холбогдлоо\n", num);
  } else if (type == WStype_DISCONNECTED) {
    Serial.printf("[%u] Web салав\n", num);
  }
}

// ----------------------------------------------------------------- SETUP
void setup() {
  Serial.begin(115200);
  delay(200);
  connectWifi();
  initIMU();
  webSocket.begin();
  webSocket.onEvent(onWsEvent);
}

// ----------------------------------------------------------------- LOOP
void loop() {
  webSocket.loop();
  if (!dmpReady) return;

  if (!mpu.dmpGetCurrentFIFOPacket(fifoBuffer)) return;

  mpu.dmpGetQuaternion(&q, fifoBuffer);
  mpu.dmpGetGravity(&gravity, &q);
  mpu.dmpGetYawPitchRoll(ypr, &q, &gravity);

  uint32_t now = millis();
  if (now - lastSendMs < SEND_INTERVAL_MS) return;
  lastSendMs = now;

  // Raw 6-axis (registers) for the web Mahony/feature pipeline.
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  float yaw   = ypr[0] * 180.0f / M_PI;
  float pitch = ypr[1] * 180.0f / M_PI;
  float roll  = ypr[2] * 180.0f / M_PI;

  float qw = q.w, qx = q.x, qy = q.y, qz = q.z;  // already float in MotionApps20
  float fax = ax / ACCEL_LSB_PER_G;
  float fay = ay / ACCEL_LSB_PER_G;
  float faz = az / ACCEL_LSB_PER_G;
  float fgx = gx / GYRO_LSB_PER_DPS;
  float fgy = gy / GYRO_LSB_PER_DPS;
  float fgz = gz / GYRO_LSB_PER_DPS;

  int n = snprintf(
    payload, sizeof(payload),
    "{\"y\":%.2f,\"p\":%.2f,\"r\":%.2f,"
    "\"qw\":%.4f,\"qx\":%.4f,\"qy\":%.4f,\"qz\":%.4f,"
    "\"ax\":%.3f,\"ay\":%.3f,\"az\":%.3f,"
    "\"gx\":%.2f,\"gy\":%.2f,\"gz\":%.2f}",
    yaw, pitch, roll, qw, qx, qy, qz, fax, fay, faz, fgx, fgy, fgz);

  if (n > 0 && n < (int)sizeof(payload)) {
    webSocket.broadcastTXT(payload, n);
  }
}
