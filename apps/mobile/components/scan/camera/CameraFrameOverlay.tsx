import { useEffect, useRef } from 'react'
import { View, Animated, Dimensions, StyleSheet } from 'react-native'
import ToothGuide from './ToothGuide'

const { width: SW, height: SH } = Dimensions.get('window')
const FT = SH * 0.20
const FB = SH * 0.78
const FL = SW * 0.06
const FH = FB - FT
const C = 28
const DARK = 'rgba(0,0,0,0.65)'

type Props = { mode: 'upper' | 'lower' }

export default function CameraFrameOverlay({ mode }: Props) {
  const pulse = useRef(new Animated.Value(0.7)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.0, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.7, duration: 750, useNativeDriver: true }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [pulse])

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: FT, backgroundColor: DARK }} />
      <View style={{ position: 'absolute', top: FB, left: 0, right: 0, bottom: 0, backgroundColor: DARK }} />
      <View style={{ position: 'absolute', top: FT, left: 0, width: FL, height: FH, backgroundColor: DARK }} />
      <View style={{ position: 'absolute', top: FT, right: 0, width: FL, height: FH, backgroundColor: DARK }} />

      {/* Corner brackets */}
      <View style={[s.c, { top: FT, left: FL, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#fff' }]} />
      <View style={[s.c, { top: FT, right: FL, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#fff' }]} />
      <View style={[s.c, { top: FB - C, left: FL, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#fff' }]} />
      <View style={[s.c, { top: FB - C, right: FL, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#fff' }]} />

      {/* Tooth guide centered in the clear zone */}
      <Animated.View
        style={{
          position: 'absolute',
          top: FT + FH / 2 - 25,
          left: FL,
          right: FL,
          alignItems: 'center',
          opacity: pulse,
        }}
      >
        <ToothGuide mode={mode} />
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  c: { position: 'absolute', width: C, height: C },
})
