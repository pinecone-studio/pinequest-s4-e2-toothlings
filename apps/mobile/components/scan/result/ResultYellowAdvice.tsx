import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'

const HOME_TIPS = [
  { icon: '🪥', text: 'Зөөлөн сойзоор болгоомжтой угаа' },
  { icon: '🍬', text: 'Чихэр, амтат ундааг түр зогсоо' },
]

export default function ResultYellowAdvice() {
  const { colors } = useTheme()
  const router = useRouter()
  return (
    <View style={s.container}>
      <View style={[s.referral, { backgroundColor: colors.triageYellowBg, borderColor: colors.triageYellowText }]}>
        <Text style={s.calIcon}>📅</Text>
        <Text style={[s.referralText, { color: colors.triageYellowText }]}>
          7–14 хоногийн дотор эмчид үзүүлэхийг зөвлөж байна
        </Text>
      </View>
      <Text style={[s.label, { color: colors.textMuted }]}>ТҮР ХҮРТЭЛ ГЭРТЭЭ</Text>
      {HOME_TIPS.map((t, i) => (
        <View key={i} style={[s.tip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={s.tipIcon}>{t.icon}</Text>
          <Text style={[s.tipText, { color: colors.textBase }]}>{t.text}</Text>
        </View>
      ))}
      <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary }]} onPress={() => router.push('/(tabs)/hospital' as never)}>
        <Text style={[s.btnText, { color: colors.primaryText }]}>Ойр эмнэлэг хайх</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container: { gap: 10 },
  referral: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1.5 },
  calIcon: { fontSize: 20 },
  referralText: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold', lineHeight: 20 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12, borderWidth: 1 },
  tipIcon: { fontSize: 18 },
  tipText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  btnText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
})
