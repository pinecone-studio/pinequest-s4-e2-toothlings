import { View, Text, StyleSheet } from 'react-native'
import { QUADRANT_LABEL_MN } from '@pinequest/core'
import type { Quadrant } from '@pinequest/types'

type Props = { quadrant: Quadrant }

const HINTS: Record<Quadrant, string> = {
  upperRight: 'Дээд эгнээний баруун талын шүд харагдахаар амаа ангайлга',
  upperLeft: 'Дээд эгнээний зүүн талын шүд харагдахаар амаа ангайлга',
  lowerRight: 'Доод эгнээний баруун талын шүд харагдахаар амаа ангайлга',
  lowerLeft: 'Доод эгнээний зүүн талын шүд харагдахаар амаа ангайлга',
}

export default function CameraHintBanner({ quadrant }: Props) {
  return (
    <View style={s.banner}>
      <Text style={s.title}>{QUADRANT_LABEL_MN[quadrant]}</Text>
      <Text style={s.hint}>{HINTS[quadrant]}</Text>
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
