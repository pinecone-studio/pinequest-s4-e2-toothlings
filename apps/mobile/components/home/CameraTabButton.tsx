import { TouchableOpacity, View, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

type Props = {
  onPress: () => void
  style?: StyleProp<ViewStyle>
  [key: string]: unknown
}

const CameraTabButton = ({ onPress, style, ...rest }: Props) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      {...rest}
      style={[style, s.wrap]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* white ring with yellow outline — seats the button cleanly into the bar */}
      <View style={[s.ring, { backgroundColor: colors.bg, borderColor: colors.primary }]}>
        <View style={[s.circle, { backgroundColor: colors.primary }]}>
          <Ionicons name="camera-outline" size={28} color={colors.primaryText} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  wrap: {
    top: -0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 66,
    height: 66,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
  },
})

export default CameraTabButton
