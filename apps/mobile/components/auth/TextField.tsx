import { View, Text, TextInput, StyleSheet, type KeyboardTypeOptions } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  keyboard?: KeyboardTypeOptions
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
}

const TextField = ({ label, value, onChange, placeholder, keyboard, autoCapitalize }: Props) => {
  const { colors } = useTheme()
  return (
    <View style={s.group}>
      <Text style={[s.label, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        style={[s.input, { borderColor: colors.border, backgroundColor: colors.surfaceRaised, color: colors.textBase }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        keyboardType={keyboard}
        autoCapitalize={autoCapitalize}
      />
    </View>
  )
}

const s = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 52, fontSize: 16 },
})

export default TextField
