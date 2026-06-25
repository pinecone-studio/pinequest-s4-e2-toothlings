import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

export type AgeGroup = 'young' | 'older'

type GroupOption = { id: AgeGroup; label: string; subtitle: string }

const GROUPS: GroupOption[] = [
  { id: 'young', label: 'Бага анги', subtitle: '7–12 нас' },
  { id: 'older', label: 'Бага ангиас дээш', subtitle: '12+ нас' },
]

type Props = {
  selected: AgeGroup
  onSelect: (group: AgeGroup) => void
}

export default function AgeGroupSelector({ selected, onSelect }: Props) {
  const { colors } = useTheme()

  return (
    <View style={s.row}>
      {GROUPS.map(({ id, label, subtitle }) => {
        const active = selected === id
        return (
          <TouchableOpacity
            key={id}
            style={[
              s.btn,
              {
                backgroundColor: active ? colors.primary : colors.surface,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(id)}
            activeOpacity={0.8}
          >
            <Text style={[s.label, { color: active ? colors.primaryText : colors.textBase }]}>{label}</Text>
            <Text style={[s.sub, { color: active ? 'rgba(26,20,7,0.6)' : colors.textMuted }]}>
              {subtitle}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 16 },
  btn: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, gap: 3 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  sub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
})
