import { View, Text, TextInput, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { value: string; onChange: (v: string) => void }

const PhoneField = ({ value, onChange }: Props) => {
  const { colors } = useTheme()
  return (
    <View style={s.group}>
      <Text style={[s.label, { color: colors.textMuted }]}>УТАСНЫ ДУГААР</Text>
      <View style={[s.row, { borderColor: colors.border, backgroundColor: colors.surfaceRaised }]}>
        <Text style={[s.prefix, { color: colors.textMuted }]}>+976</Text>
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <TextInput
          style={[s.input, { color: colors.textBase }]}
          value={value}
          onChangeText={onChange}
          keyboardType="phone-pad"
          placeholder="9911 2233"
          placeholderTextColor={colors.textDisabled}
          maxLength={8}
        />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 52 },
  prefix: { fontSize: 16, fontFamily: 'Inter_500Medium', marginRight: 12 },
  divider: { width: 1, height: 20, marginRight: 12 },
  input: { flex: 1, fontSize: 16, fontFamily: 'Inter_500Medium' },
})

export default PhoneField
