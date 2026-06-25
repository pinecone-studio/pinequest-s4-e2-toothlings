import { View, Text, TextInput, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { value: string; onChange: (v: string) => void; label?: string; hint?: string }

const PinField = ({ value, onChange, label = 'НЭВТРЭХ КОД', hint }: Props) => {
  const { colors } = useTheme()
  return (
    <View style={s.group}>
      <View style={s.labelRow}>
        <Text style={[s.label, { color: colors.textMuted }]}>{label}</Text>
        {hint ? <Text style={[s.hint, { color: colors.textDisabled }]}>{hint}</Text> : null}
      </View>
      <TextInput
        style={[s.input, { borderColor: colors.border, backgroundColor: colors.surfaceRaised, color: colors.textBase }]}
        value={value}
        onChangeText={onChange}
        secureTextEntry
        keyboardType="numeric"
        placeholder="••••••"
        placeholderTextColor={colors.textDisabled}
        maxLength={20}
      />
    </View>
  )
}

const s = StyleSheet.create({
  group: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  hint: { fontSize: 11 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 22,
    letterSpacing: 6,
  },
})

export default PinField
