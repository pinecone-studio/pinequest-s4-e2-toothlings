import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

export type EditableStudent = { firstName: string; lastName: string; birthYear: string; guardianEmail: string }

type Props = { index: number; value: EditableStudent; onChange: (v: EditableStudent) => void; onRemove: () => void }

const RosterRow = ({ index, value, onChange, onRemove }: Props) => {
  const { colors } = useTheme()
  const field = (key: keyof EditableStudent) => (t: string) => onChange({ ...value, [key]: t })
  const inputStyle = [s.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.textBase }]

  return (
    <View style={[s.card, { borderColor: colors.border, backgroundColor: colors.surfaceRaised }]}>
      <View style={s.head}>
        <Text style={[s.slot, { color: colors.textMuted }]}>№{index + 1}</Text>
        <TouchableOpacity onPress={onRemove} hitSlop={8}><Ionicons name="trash-outline" size={18} color={colors.triageRedText} /></TouchableOpacity>
      </View>
      <View style={s.nameRow}>
        <TextInput style={[...inputStyle, s.half]} value={value.lastName} onChangeText={field('lastName')} placeholder="Овог" placeholderTextColor={colors.textDisabled} />
        <TextInput style={[...inputStyle, s.half]} value={value.firstName} onChangeText={field('firstName')} placeholder="Нэр" placeholderTextColor={colors.textDisabled} />
      </View>
      <View style={s.nameRow}>
        <TextInput style={[...inputStyle, s.year]} value={value.birthYear} onChangeText={field('birthYear')} placeholder="Төрсөн он" placeholderTextColor={colors.textDisabled} keyboardType="number-pad" maxLength={4} />
        <TextInput style={[...inputStyle, s.email]} value={value.guardianEmail} onChangeText={field('guardianEmail')} placeholder="Эцэг эхийн и-мэйл (заавал биш)" placeholderTextColor={colors.textDisabled} keyboardType="email-address" autoCapitalize="none" />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 12, gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slot: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  nameRow: { flexDirection: 'row', gap: 8 },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 14 },
  half: { flex: 1 },
  year: { width: 110 },
  email: { flex: 1 },
})

export default RosterRow
