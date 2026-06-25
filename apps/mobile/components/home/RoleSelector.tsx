import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

const ROLE_LABELS: Record<string, string> = {
  screener:           'Скринер',
  'dentist-reviewer': 'Шүдний эмч',
  'follow-up-worker': 'Дагалт',
  admin:              'Админ',
}

type Props = { role: string }

const RoleSelector = ({ role }: Props) => {
  const { colors } = useTheme()
  const label = ROLE_LABELS[role] ?? 'Скринер'

  return (
    <TouchableOpacity
      style={[s.pill, { borderColor: colors.primary }]}
      activeOpacity={0.7}
    >
      <Text style={[s.label, { color: colors.primary }]}>{label}</Text>
      <Ionicons name="chevron-down" size={14} color={colors.primary} />
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5,
  },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
})

export default RoleSelector
