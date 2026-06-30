import { View, Text, TextInput, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { value: string; onChange: (v: string) => void }

const isPhoneMode = (v: string) => /^\d*$/.test(v) && !v.includes('@')

const LoginIdentifierField = ({ value, onChange }: Props) => {
  const { colors } = useTheme()
  const phoneMode = isPhoneMode(value)

  return (
    <View style={s.group}>
      <Text style={s.label}>
        <Text style={phoneMode ? [s.labelActive, { color: colors.textBase }] : { color: colors.textMuted }}>
          УТАСНЫ ДУГААР
        </Text>
        <Text style={{ color: colors.textMuted }}> / </Text>
        <Text style={!phoneMode ? [s.labelActive, { color: colors.textBase }] : { color: colors.textMuted }}>
          И-МЭЙЛ ХАЯГ
        </Text>
      </Text>
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
  label: { fontSize: 11, fontFamily: 'Inter_500Medium', letterSpacing: 0.8 },
  labelActive: { fontFamily: 'Inter_700Bold' },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, paddingHorizontal: 14, height: 52 },
  prefix: { fontSize: 16, fontFamily: 'Inter_500Medium', marginRight: 12 },
  divider: { width: 1, height: 20, marginRight: 12 },
  input: { flex: 1, fontSize: 16, fontFamily: 'Inter_500Medium' },
})

export default LoginIdentifierField
