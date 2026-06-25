import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { screeningId: string; onRetake: () => void; onHome: () => void }

export default function ResultBottomActions({ screeningId: _screeningId, onRetake, onHome }: Props) {
  const { colors } = useTheme()

  const openPdf = () => {
    Alert.alert('Тун удахгүй', 'PDF хадгалах функц удахгүй нэмэгдэнэ.')
  }

  return (
    <View style={s.container}>
      <View style={s.row}>
        <TouchableOpacity style={[s.outlineBtn, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={openPdf}>
          <Text style={[s.outlineText, { color: colors.textBase }]}>PDF хадгалах</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.primaryBtn, { backgroundColor: colors.primary }]} onPress={onRetake}>
          <Text style={[s.primaryText, { color: colors.primaryText }]}>Дахин шалгах</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[s.homeBtn, { borderColor: colors.border }]} onPress={onHome}>
        <Text style={[s.homeText, { color: colors.textMuted }]}>Нүүр хуудас руу буцах</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  outlineBtn: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1 },
  outlineText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  primaryBtn: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center' },
  primaryText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  homeBtn: { borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1 },
  homeText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
})
