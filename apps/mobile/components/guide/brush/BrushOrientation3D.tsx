import { type RefObject } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Canvas } from '@react-three/fiber/native'
import { useTheme } from '@/lib/ThemeContext'
import { BrushScene } from './BrushScene'
import type { Mpu6050Tracker } from '@/lib/mpu6050/tracker'
import type { Esp32ConnectionStatus } from '@/lib/brush/useEsp32Imu'
import type { ImuReading } from '@/lib/brush/imu'

const STATUS_MN: Record<Esp32ConnectionStatus, string> = {
  idle: 'Идэвхгүй', connecting: 'Холбогдож байна…', connected: 'Холбогдсон', disconnected: 'Салсан', error: 'Алдаа',
}
const STATUS_DOT: Record<Esp32ConnectionStatus, string> = {
  idle: '#94A3B8', connecting: '#F2B705', connected: '#52A075', disconnected: '#94A3B8', error: '#C07272',
}
const AXES = [
  { key: 'yaw', label: 'Yaw', color: '#3b82f6' },
  { key: 'pitch', label: 'Pitch', color: '#22c55e' },
  { key: 'roll', label: 'Roll', color: '#ef4444' },
] as const

type Props = {
  reading: ImuReading | null
  trackerRef: RefObject<Mpu6050Tracker>
  status: Esp32ConnectionStatus
  onCalibrate: () => void
}

/** Live 3D brush orientation from the ESP32 IMU + axis readout + calibrate. */
export const BrushOrientation3D = ({ reading, trackerRef, status, onCalibrate }: Props) => {
  const { colors } = useTheme()
  return (
    <View style={[s.card, { borderColor: colors.border }]}>
      <View style={[s.head, { borderBottomColor: colors.border }]}>
        <Text style={[s.title, { color: colors.textBase }]}>Сойзны чиглэл (бодит цаг)</Text>
        <View style={s.statusRow}>
          <View style={[s.dot, { backgroundColor: STATUS_DOT[status] }]} />
          <Text style={[s.statusText, { color: colors.textMuted }]}>{STATUS_MN[status]}</Text>
        </View>
      </View>

      <View style={s.canvasWrap}>
        <Canvas camera={{ position: [1.35, 1.05, 1.35], fov: 42, near: 0.1, far: 20 }}>
          <color attach="background" args={['#0f172a']} />
          <BrushScene trackerRef={trackerRef} />
        </Canvas>
      </View>

      <View style={s.axisRow}>
        {AXES.map(({ key, label, color }) => (
          <View key={key} style={s.axis}>
            <Text style={[s.axisLabel, { color }]}>{label}</Text>
            <Text style={[s.axisValue, { color: colors.textBase }]}>
              {reading ? `${reading[key].toFixed(0)}°` : '—'}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={[s.calBtn, { borderColor: colors.border, backgroundColor: colors.surfaceRaised }]} onPress={onCalibrate} activeOpacity={0.8}>
        <Text style={[s.calText, { color: colors.textBase }]}>Тэгшлэх (0°)</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  title: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 9999 },
  statusText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  canvasWrap: { height: 240, backgroundColor: '#0f172a' },
  axisRow: { flexDirection: 'row', paddingHorizontal: 14, paddingTop: 12, gap: 10 },
  axis: { flex: 1, alignItems: 'center' },
  axisLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  axisValue: { fontSize: 18, fontFamily: 'Inter_700Bold', marginTop: 2 },
  calBtn: { margin: 14, borderRadius: 9999, borderWidth: StyleSheet.hairlineWidth, paddingVertical: 11, alignItems: 'center' },
  calText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
})
