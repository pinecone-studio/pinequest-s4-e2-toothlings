import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

const ROLES = [
  { key: 'parent', emoji: '👨‍👩‍👧', label: 'Эцэг эх' },
  { key: 'teacher', emoji: '🧑‍🏫', label: 'Багш' },
  { key: 'health', emoji: '⚕️', label: 'ЭМ ажилтан' },
] as const

export type RoleKey = typeof ROLES[number]['key']

type Props = {
  selected?: RoleKey | null
  onSelect?: (key: RoleKey) => void
}

const RoleChips = ({ selected, onSelect }: Props) => {
  const { colors } = useTheme()
  return (
    <View style={s.row}>
      {ROLES.map(({ key, emoji, label }) => {
        const active = selected === key
        return (
          <TouchableOpacity
            key={key}
            style={[
              s.chip,
              {
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary + '22' : 'transparent',
              },
            ]}
            onPress={() => onSelect?.(key)}
            activeOpacity={onSelect ? 0.7 : 1}
          >
            <Text style={s.emoji}>{emoji}</Text>
            <Text style={[s.chipLabel, { color: active ? colors.primary : colors.textMuted }]}>
              {label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  emoji: { fontSize: 14 },
  chipLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
})

export default RoleChips
