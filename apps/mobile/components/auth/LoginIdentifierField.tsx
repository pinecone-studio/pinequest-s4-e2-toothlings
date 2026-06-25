import { View, Text, TextInput, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { value: string; onChange: (v: string) => void }

const isPhoneMode = (v: string) => /^\d*$/.test(v) && !v.includes('@')

const LoginIdentifierField = ({ value, onChange }: Props) => {
  const { colors } = useTheme()
  const phoneMode = isPhoneMode(value)

  return (
    <View style={s.group}>
      <Text style={[s.label, { color: colors.textMuted }]}>УТАСНЫ ДУГААР / И-МЭЙ ХАЯГ</Text>
      <View style={[s.row, { borderColor: colors.border, backgroundColor: colors.surfaceRaised }]}>
        {phoneMode && (
          <>
            <Text style={[s.prefix, { color: colors.textMuted }]}>+976</Text>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
          </>
        )}
        <TextInput
          style={[s.input, { color: colors.textBase }]}
          value={value}
          onChangeText={onChange}
          placeholder={phoneMode ? '9911 2233' : 'name@example.com'}
          placeholderTextColor={colors.textDisabled}
          keyboardType={phoneMode && value.length > 0 ? 'phone-pad' : 'email-address'}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={phoneMode ? 8 : 120}
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

export default LoginIdentifierField
