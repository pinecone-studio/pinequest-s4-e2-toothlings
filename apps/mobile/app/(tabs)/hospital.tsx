import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/lib/ThemeContext'

const HospitalScreen = () => {
  const { colors } = useTheme()
  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={s.center}>
        <Text style={[s.title, { color: colors.textBase }]}>Эмнэлэг</Text>
        <Text style={[s.sub, { color: colors.textMuted }]}>Удахгүй нэмэгдэнэ</Text>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular' },
})

export default HospitalScreen
