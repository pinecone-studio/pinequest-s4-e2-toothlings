import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
}

const PrimaryButton = ({ label, onPress, loading, disabled }: Props) => {
  const { colors } = useTheme()
  const isDisabled = disabled || loading
  return (
    <TouchableOpacity
      style={[s.btn, { backgroundColor: colors.primary, opacity: isDisabled ? 0.55 : 1 }]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
    >
      {loading
        ? <ActivityIndicator color={colors.primaryText} />
        : <Text style={[s.label, { color: colors.primaryText }]}>{label}</Text>
      }
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  btn: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
})

export default PrimaryButton
