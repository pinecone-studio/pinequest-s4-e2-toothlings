import { BlurView } from 'expo-blur'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import { TAB_BAR_RADIUS } from '@/lib/tabBarLayout'

/**
 * Apple-style frosted-glass fill for the floating tab bar.
 * Native blur + a translucent tint + a hairline highlight so the bar reads
 * as a pane of glass floating over the screen content.
 */
const GlassTabBarBackground = () => {
  const { dark } = useTheme()

  return (
    <View style={s.clip}>
      <BlurView
        intensity={dark ? 55 : 70}
        tint={dark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            // lighter tint so screen content stays visible through the glass
            backgroundColor: dark ? 'rgba(28,28,30,0.35)' : 'rgba(255,255,255,0.38)',
            borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.6)',
            borderWidth: StyleSheet.hairlineWidth,
            borderRadius: TAB_BAR_RADIUS,
          },
        ]}
      />
    </View>
  )
}

const s = StyleSheet.create({
  clip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TAB_BAR_RADIUS,
    overflow: 'hidden',
  },
})

export default GlassTabBarBackground
