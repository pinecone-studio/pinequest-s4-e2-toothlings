import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

const OrDivider = () => {
  const { colors } = useTheme()
  return (
    <View style={s.row}>
      <View style={[s.line, { backgroundColor: colors.border }]} />
      <Text style={[s.text, { color: colors.textMuted }]}>эсвэл</Text>
      <View style={[s.line, { backgroundColor: colors.border }]} />
    </View>
  )
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1 },
  text: { fontSize: 13 },
})

export default OrDivider
