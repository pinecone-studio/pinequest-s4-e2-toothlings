import { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useTheme } from '@/lib/ThemeContext'

type Props = { onScan: () => void }

// Three steps, each its own blurred gradient chip in one of the 3 colors.
const SUB_CHIPS = [
  { word: 'Асуумж', rgb: '130,192,204' }, // #00b2ca
  { word: 'Дүгнэлт', rgb: '0,178,202' }, // #1d4e89
  { word: 'Шүд угаалт', rgb: '29,78,137' }, // #82c0cc
]

// Teal palette repeated so the gradient tiles seamlessly across 2× the card
// width — translating it by one card width loops with no visible seam.
const WAVE_COLORS = [
  'rgba(21,184,171,0.74)',
  'rgba(14,149,148,0.74)',
  'rgba(10,111,110,0.74)',
  'rgba(21,184,171,0.74)',
  'rgba(14,149,148,0.74)',
  'rgba(10,111,110,0.74)',
  'rgba(21,184,171,0.74)',
] as const

// Glassy teal hero: a real expo-blur frost behind an animated, waving teal
// gradient (#0E9594) + a white sheen, with white text and a frosted button.
const ScanHeroCard = ({ onScan }: Props) => {
  const { dark } = useTheme()
  const wave = useRef(new Animated.Value(0)).current
  const [cardW, setCardW] = useState(0)

  useEffect(() => {
    if (cardW <= 0) return
    wave.setValue(0)
    // Slow ease-in-out back-and-forth = a gentle "breathing" drift.
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(wave, {
          toValue: 1,
          duration: 4500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(wave, {
          toValue: 0,
          duration: 4500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [cardW, wave])

  // soft drift (half a card width) + subtle brightness pulse
  const translateX = wave.interpolate({ inputRange: [0, 1], outputRange: [0, -cardW * 0.5] })
  const waveOpacity = wave.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.92, 1, 0.92] })

  return (
    <View style={s.shadow}>
      <View
        style={s.card}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width
          setCardW((prev) => (prev !== w ? w : prev))
        }}
      >
        {/* real frosted-glass blur of whatever is behind the card */}
        <BlurView intensity={50} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

        {/* animated waving teal gradient (semi-transparent so the blur shows through) */}
        {cardW > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[s.waveLayer, { width: cardW * 2, opacity: waveOpacity, transform: [{ translateX }] }]}
          >
            <LinearGradient
              colors={WAVE_COLORS}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        ) : (
          <LinearGradient
            colors={['rgba(21,184,171,0.74)', 'rgba(14,149,148,0.74)', 'rgba(10,111,110,0.74)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* glass sheen */}
        <LinearGradient
          colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={s.content}>
          <View style={s.textCol}>
            <Text style={s.title}>Амны хөндийн байдал</Text>
            <View style={s.subRow}>
              {SUB_CHIPS.map((c) => (
                <View key={c.word} style={s.chip}>
                  {/* blurred, single-color gradient chip behind each word */}
                  <BlurView intensity={30} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                  <LinearGradient
                    colors={[`rgba(${c.rgb},0.9)`, `rgba(${c.rgb},0.6)`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={s.sub}>{c.word}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={s.btn} onPress={onScan} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  // shadow lives on an un-clipped wrapper (the inner card uses overflow:hidden)
  shadow: {
    borderRadius: 20,
    shadowColor: '#0A6F6E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  card: { borderRadius: 20, overflow: 'hidden' },
  waveLayer: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 22,
  },
  textCol: { gap: 6, alignItems: 'flex-start' },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: -0.3, color: '#FFFFFF' },
  subRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  sub: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#FFFFFF' },
  btn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.45)',
  },
})

export default ScanHeroCard
