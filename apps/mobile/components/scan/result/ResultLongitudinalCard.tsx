import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import type { TriageLevel } from '@pinequest/types'

const LEVEL_LABEL: Record<string, string> = {
  red: 'Яаралтай', yellow: 'Эмчилгээ', green: 'Хэвийн',
}
const RANK: Record<string, number> = { green: 0, yellow: 1, red: 2 }

const getDelta = (prior: string, current: string) => {
  const d = (RANK[current] ?? 0) - (RANK[prior] ?? 0)
  if (d > 0) return { icon: '↓', label: 'Хүндэрсэн', color: '#A84545' }
  if (d < 0) return { icon: '↑', label: 'Сайжирсан', color: '#3B8C5E' }
  return { icon: '→', label: 'Өөрчлөгдөөгүй', color: '#8A8A8A' }
}

type Props = { currentLevel: TriageLevel; priorLevel: string }

/** Shows prior-season vs current triage level. Only renders when history cache has data. */
const ResultLongitudinalCard = ({ currentLevel, priorLevel }: Props) => {
  const { colors } = useTheme()
  const delta = getDelta(priorLevel, currentLevel)

  const bgs = (lv: string) =>
    lv === 'red' ? colors.triageRedBg : lv === 'yellow' ? colors.triageYellowBg : colors.triageGreenBg
  const texts = (lv: string) =>
    lv === 'red' ? colors.triageRedText : lv === 'yellow' ? colors.triageYellowText : colors.triageGreenText

  return (
    <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[s.heading, { color: colors.textMuted }]}>Өмнөх улиралын харьцуулалт</Text>
      <View style={s.row}>
        <View style={s.col}>
          <Text style={[s.colLabel, { color: colors.textMuted }]}>Өмнөх</Text>
          <View style={[s.badge, { backgroundColor: bgs(priorLevel) }]}>
            <Text style={[s.badgeText, { color: texts(priorLevel) }]}>{LEVEL_LABEL[priorLevel] ?? priorLevel}</Text>
          </View>
        </View>
        <Text style={[s.arrow, { color: delta.color }]}>{delta.icon}</Text>
        <View style={s.col}>
          <Text style={[s.colLabel, { color: colors.textMuted }]}>Одоогийн</Text>
          <View style={[s.badge, { backgroundColor: bgs(currentLevel) }]}>
            <Text style={[s.badgeText, { color: texts(currentLevel) }]}>{LEVEL_LABEL[currentLevel] ?? currentLevel}</Text>
          </View>
        </View>
      </View>
      <Text style={[s.deltaLabel, { color: delta.color }]}>{delta.label}</Text>
    </View>
  )
}

export default ResultLongitudinalCard

const s = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 10 },
  heading: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  colLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'stretch', alignItems: 'center' },
  badgeText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  arrow: { fontSize: 22, fontFamily: 'Inter_700Bold', paddingHorizontal: 4 },
  deltaLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
})
