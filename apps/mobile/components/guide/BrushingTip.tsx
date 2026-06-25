import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { text: string }

export default function BrushingTip({ text }: Props) {
  const { colors } = useTheme()
  return (
    <View style={[s.box, { backgroundColor: colors.triageYellowBg, borderColor: colors.border }]}>
      <Text style={s.icon}>💡</Text>
      <Text style={[s.text, { color: colors.triageYellowText }]}>{text}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  box: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 14, borderWidth: 1, alignItems: 'flex-start' },
  icon: { fontSize: 16, lineHeight: 22 },
  text: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
})
