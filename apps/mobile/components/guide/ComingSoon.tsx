import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import GuideCalendar from './GuideCalendar'

export default function ComingSoon() {
  const { colors } = useTheme()
  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <View style={[s.badge, { backgroundColor: colors.triageYellowBg, borderColor: colors.border }]}>
        <Text style={[s.badgeText, { color: colors.triageYellowText }]}>Удахгүй нэмэгдэнэ</Text>
      </View>
      <GuideCalendar />
      <Text style={[s.desc, { color: colors.textMuted }]}>
        Шүд угаасан ханалтын хэсэг хөгжүүлэгдэж байна. Тун удахгүй ашиглах боломжтой болно.
      </Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  badge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start', borderWidth: 1, marginBottom: 14 },
  badgeText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  desc: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 14, lineHeight: 20 },
})
