import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import { useFloatingTabBarPad } from '@/lib/tabBarLayout'
import { BrushOrientation3D } from './BrushOrientation3D'
import { BrushZoneCoverage } from './BrushZoneCoverage'
import { BrushArchMonitor } from './BrushArchMonitor'
import { useEsp32Imu } from '@/lib/brush/useEsp32Imu'
import { useBrushRecognizer } from '@/lib/brush/useBrushRecognizer'
import { useBrushMl } from '@/lib/brush/useBrushMl'
import { totalBrushSeconds } from '@/lib/brush/coverageQuery'
import { SESSION_TARGET_SECONDS } from '@/lib/brush/config'
import { DEFAULT_ESP32_WS_URL } from '@/lib/brush/imu'

const mmss = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`

/** Smart brushing monitor: live 3D orientation + per-zone & per-tooth coverage. */
export const BrushMonitor = () => {
  const { colors } = useTheme()
  const tabBarPad = useFloatingTabBarPad()
  const [running, setRunning] = useState(false)

  const recognizer = useBrushRecognizer()
  const { status, reading, trackerRef, calibrate } = useEsp32Imu(DEFAULT_ESP32_WS_URL, true, recognizer.handleSample)
  const { coverage, currentZone } = recognizer
  const { mlState, reset: resetMl } = useBrushMl(currentZone, running)

  const activeSeconds = Math.round(totalBrushSeconds(coverage))

  const start = () => {
    recognizer.resetCoverage()
    resetMl()
    recognizer.setRunning(true)
    setRunning(true)
  }
  const stop = () => {
    recognizer.setRunning(false)
    setRunning(false)
  }

  return (
    <ScrollView contentContainerStyle={[s.wrap, { paddingBottom: tabBarPad }]} showsVerticalScrollIndicator={false}>
      <BrushOrientation3D reading={reading} trackerRef={trackerRef} status={status} onCalibrate={calibrate} />

      <View style={[s.timerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.timerLabel, { color: colors.textMuted }]}>ИДЭВХТЭЙ УГААЛГА</Text>
        <Text style={[s.timer, { color: colors.textBase }]}>{mmss(activeSeconds)}</Text>
        <View style={[s.track, { backgroundColor: colors.border }]}>
          <View style={[s.fill, { width: `${Math.min(100, (activeSeconds / SESSION_TARGET_SECONDS) * 100)}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[s.hint, { color: colors.textMuted }]}>Зорилт 02:00 · зөвхөн сойзоо хөдөлгөхөд оноо нэмэгдэнэ</Text>
      </View>

      <BrushZoneCoverage coverage={coverage} currentZone={currentZone} />
      <BrushArchMonitor mlState={mlState} running={running} />

      <TouchableOpacity
        style={[s.actionBtn, { backgroundColor: running ? colors.btnFill : colors.primary }]}
        onPress={running ? stop : start}
        activeOpacity={0.85}
      >
        <Text style={[s.actionText, { color: running ? colors.textBase : colors.primaryText }]}>
          {running ? 'Дуусгах' : 'Эхлэх'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap: { gap: 14, padding: 16 },
  timerCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, alignItems: 'center' },
  timerLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  timer: { fontSize: 42, fontFamily: 'Inter_700Bold', marginTop: 4 },
  track: { width: '100%', height: 8, borderRadius: 9999, overflow: 'hidden', marginTop: 10 },
  fill: { height: '100%', borderRadius: 9999 },
  hint: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 8, textAlign: 'center' },
  actionBtn: { borderRadius: 9999, paddingVertical: 15, alignItems: 'center' },
  actionText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
})
