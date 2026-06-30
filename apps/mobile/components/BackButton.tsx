import { TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'

type Props = { onPress?: () => void; color?: string; style?: StyleProp<ViewStyle> }

const BackButton = ({ onPress, color, style }: Props) => {
  const { colors } = useTheme()
  const router = useRouter()
  return (
    <TouchableOpacity
      style={[s.back, { borderColor: colors.border }, style]}
      onPress={onPress ?? (() => router.back())}
      activeOpacity={1}
    >
      <Ionicons name="chevron-back" size={20} color={color ?? colors.textBase} />
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  back: { width: 40, height: 40, borderRadius: 9999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
})

export default BackButton
