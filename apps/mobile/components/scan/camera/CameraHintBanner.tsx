import { View, Text, StyleSheet } from 'react-native'

type Props = { mode: 'upper' | 'lower' }

const LABELS = { upper: 'Дээд талын шүд', lower: 'Доод талын шүд' }
const HINTS = {
  upper: 'Дээд шүдээ харагдахаар амаа ангайлга',
  lower: 'Доод шүдээ харагдахаар амаа ангайлга',
}

export default function CameraHintBanner({ mode }: Props) {
  return (
    <View style={s.banner}>
      <Text style={s.title}>{LABELS[mode]}</Text>
      <Text style={s.hint}>{HINTS[mode]}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  banner: {
    position: 'absolute', top: 56, left: 16, right: 16,
    backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 14, padding: 14,
  },
  title: { color: '#fff', fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter_400Regular' },
})
