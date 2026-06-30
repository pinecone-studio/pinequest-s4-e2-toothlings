import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

type Props = {
  date: string
  triageLevel: 'green' | 'yellow' | 'red'
  summary: string
  onPress: () => void
}

const LastScreeningCard = ({ date, triageLevel, summary, onPress }: Props) => {
  const { colors } = useTheme()
  const dotColor =
    triageLevel === 'red' ? colors.badgeRed
    : triageLevel === 'yellow' ? colors.badgeYellow
    : colors.badgeGreen

  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[s.dot, { backgroundColor: dotColor }]} />
      <View style={s.body}>
        <Text style={[s.label, { color: colors.textMuted }]}>Сүүлийн дүгнэлт</Text>
        <Text style={[s.summary, { color: colors.textBase }]} numberOfLines={2}>{summary}</Text>
        <Text style={[s.date, { color: colors.textMuted }]}>{date}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 16, padding: 16, borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  body: { flex: 1, gap: 2 },
  label: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  summary: { fontSize: 14, fontFamily: 'Inter_500Medium', lineHeight: 20 },
  date: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
})

export default LastScreeningCard
