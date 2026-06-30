import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import type { InferenceDetection } from '@pinequest/types'
import { findingLabel } from './findingLabels'

type Props = { detections: InferenceDetection[] }

export default function ResultDetectionList({ detections }: Props) {
  const { colors } = useTheme()

  if (!detections.length) {
    return (
      <View style={[s.empty, { backgroundColor: colors.triageGreenBg }]}>
        <Text style={[s.emptyText, { color: colors.triageGreenText }]}>
          ✓ Эдгээр зурагт аюулын тодорхой шинж илрээгүй
        </Text>
      </View>
    )
  }

  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence)

  return (
    <View style={s.container}>
      <Text style={[s.label, { color: colors.textMuted }]}>
        ИЛРҮҮЛСЭН ЗҮЙЛС ({detections.length})
      </Text>
      {sorted.map((d, i) => (
        <View key={i} style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[s.dot, { backgroundColor: colors.triageYellowText }]} />
          <Text style={[s.name, { color: colors.textBase }]}>{findingLabel(d.className)}</Text>
          <Text style={[s.pct, { color: colors.textMuted }]}>{(d.confidence * 100).toFixed(0)}%</Text>
        </View>
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: StyleSheet.hairlineWidth },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium' },
  pct: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  empty: { borderRadius: 14, padding: 16, alignItems: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_500Medium', textAlign: 'center' },
})
