import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { screeningId: string; onRetake: () => void; onHome: () => void }

export default function ResultBottomActions({ screeningId: _screeningId, onRetake, onHome }: Props) {
  const { colors } = useTheme()

  return (
    <View style={s.row}>
      <TouchableOpacity style={[s.btn, { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border }]} onPress={onHome}>
        <Text style={[s.btnText, { color: colors.textMuted }]}>Нүүр хуудас{'\n'}руу буцах</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary }]} onPress={onRetake}>
        <Text style={[s.btnText, { color: colors.primaryText }]}>Дахин{'\n'}шалгах</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 14, fontFamily: 'Inter_700Bold', textAlign: 'center', lineHeight: 19 },
})
