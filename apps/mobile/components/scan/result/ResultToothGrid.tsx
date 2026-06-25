import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import { TriageLevel } from './ResultTriageCard'

type Props = { level: TriageLevel; detectionsCount: number }

const COLS = 7

export default function ResultToothGrid({ level, detectionsCount }: Props) {
  const { colors } = useTheme()
  const gridBg = level === 'green' ? colors.triageGreenBg : level === 'yellow' ? colors.triageYellowBg : colors.triageRedBg
  const hitBg = level === 'yellow' ? '#FFDF8A' : level === 'red' ? '#F8A0A0' : null
  const hitBorder = level === 'yellow' ? colors.triageYellowText : level === 'red' ? colors.triageRedText : null
  const sectionLabel = level === 'green' ? 'ШИНЖИЛСЭН ЗУРАГ' : 'ИЛЭРСЭН ХЭСЭГ'
  const badge = level === 'green' ? '✓ Цэвэр' : `${detectionsCount} анхаарах`
  const badgeColor = level === 'green' ? colors.triageGreenText : level === 'yellow' ? colors.triageYellowText : colors.triageRedText

  const hitSet = new Set<number>()
  for (let i = 0; i < Math.min(detectionsCount, COLS * 2); i++) hitSet.add(i)

  const Tooth = ({ idx }: { idx: number }) => {
    const hit = hitSet.has(idx) && level !== 'green'
    return (
      <View style={[
        s.tooth,
        { backgroundColor: colors.surface, borderColor: colors.border },
        hit && hitBg ? { backgroundColor: hitBg, borderColor: hitBorder ?? colors.border } : null,
      ]} />
    )
  }

  return (
    <View>
      <Text style={[s.sectionLabel, { color: colors.textMuted }]}>{sectionLabel}</Text>
      <View style={[s.grid, { backgroundColor: gridBg }]}>
        <View style={s.row}>{Array.from({ length: COLS }, (_, i) => <Tooth key={i} idx={i} />)}</View>
        <View style={s.row}>{Array.from({ length: COLS }, (_, i) => <Tooth key={i} idx={i + COLS} />)}</View>
        <View style={[s.badge, { backgroundColor: badgeColor }]}>
          <Text style={s.badgeText}>{badge}</Text>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 8 },
  grid: { borderRadius: 16, padding: 14, gap: 8 },
  row: { flexDirection: 'row', gap: 6 },
  tooth: { flex: 1, height: 34, borderRadius: 8, borderWidth: 1.5 },
  badge: { alignSelf: 'flex-end', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
})
