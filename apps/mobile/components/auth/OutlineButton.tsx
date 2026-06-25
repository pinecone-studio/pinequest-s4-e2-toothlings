import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { label: string; onPress: () => void }

const OutlineButton = ({ label, onPress }: Props) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      style={[s.btn, { borderColor: colors.primary }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[s.label, { color: colors.primary }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  btn: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  label: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
})

export default OutlineButton
