import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'

type Level = 'green' | 'yellow' | 'red'

const INFO: Record<Level, { label: string; summary: string; action: string }> = {
  green: {
    label: 'Аюулын шинж илрээгүй',
    summary: 'Эдгээр зурагт аюулын шинж тэмдэг илрээгүй. Хэвийн шүдний үзлэгт хамруулахыг зөвлөж байна.',
    action: 'Ойрын 6 сарын дотор шүдний эмчид үзүүлэхийг зөвлөж байна.',
  },
  yellow: {
    label: 'Шалгуулах шаардлагатай',
    summary: 'Шалгуулах шаардлагатай зарим шинж илэрлээ. Хэдэн долоо хоногийн дотор шүдний эмч үзэх хэрэгтэй.',
    action: 'Ойрын хэдэн долоо хоногийн дотор шүдний эмчид хандуулна уу.',
  },
  red: {
    label: 'Яаралтай анхаарал шаардлагатай',
    summary: 'Яаралтай анхаарал шаардсан шинж илэрлээ. Аль болох хурдан шүдний эмчид хандуулна уу.',
    action: 'Аль болох хурдан — энэ 7 хоногт — шүдний эмчид хандуулна уу.',
  },
}

const SMS_BODY: Record<Level, string> = {
  green: 'Шүдний шалгалтын дүн: Аюулын шинж тэмдэг илрээгүй. Хэвийн шүдний үзлэгт хамруулаарай. (Энэ нь оношилгоо биш, урьдчилсан шалгалтын хэрэгсэл юм. Шүдний эмч баталгаажуулна.)',
  yellow: 'Шүдний шалгалтын дүн: Зарим шинж илэрлээ. Хэдэн долоо хоногийн дотор шүдний эмчид хандуулна уу. (Энэ нь оношилгоо биш, урьдчилсан шалгалтын хэрэгсэл юм. Шүдний эмч баталгаажуулна.)',
  red: 'Шүдний шалгалтын дүн: ЯАРАЛТАЙ. Аль болох хурдан шүдний эмчид хандуулна уу. (Энэ нь оношилгоо биш, урьдчилсан шалгалтын хэрэгсэл юм. Шүдний эмч баталгаажуулна.)',
}

export default function ResultScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const params = useLocalSearchParams<{ triageLevel: string; triageScore: string; detectionsCount: string; screeningId: string; guardianPhone: string }>()

  const level = (params.triageLevel ?? 'green') as Level
  const info = INFO[level] ?? INFO.green
  const count = Number(params.detectionsCount ?? '0')
  const phone = params.guardianPhone ?? ''

  const triageBg = level === 'green' ? colors.triageGreenBg : level === 'yellow' ? colors.triageYellowBg : colors.triageRedBg
  const triageText = level === 'green' ? colors.triageGreenText : level === 'yellow' ? colors.triageYellowText : colors.triageRedText

  const sendSms = () => {
    if (!phone) return
    const body = encodeURIComponent(SMS_BODY[level])
    Linking.openURL(`sms:${phone}?body=${body}`)
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={[s.card, { backgroundColor: triageBg }]}>
        <Text style={[s.label, { color: triageText }]}>{info.label}</Text>
        <Text style={[s.summary, { color: triageText }]}>{info.summary}</Text>
      </View>

      <Text style={[s.action, { color: colors.textBase }]}>{info.action}</Text>
      <Text style={[s.count, { color: colors.textMuted }]}>{count > 0 ? `${count} илрэл олдлоо` : 'Илрэл олдсонгүй'}</Text>

      <View style={[s.disclaimer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.disclaimerText, { color: colors.textMuted }]}>
          Энэ нь оношилгоо биш, урьдчилсан шалгалтын хэрэгсэл юм. Шүдний эмч баталгаажуулна.
        </Text>
      </View>

      <View style={s.actions}>
        {!!phone && level !== 'green' && (
          <TouchableOpacity style={[s.smsBtn, { backgroundColor: colors.primary }]} onPress={sendSms}>
            <Text style={s.smsBtnText}>📱 Эцэг эхэд мессеж илгээх</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[s.homeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.replace('/(tabs)')}>
          <Text style={[s.homeBtnText, { color: colors.textBase }]}>Нүүр хуудас руу буцах</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.retakeBtn, { borderColor: colors.border }]} onPress={() => router.back()}>
          <Text style={[s.retakeBtnText, { color: colors.textMuted }]}>Дахин авах</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, padding: 20 },
  card: { borderRadius: 20, padding: 22, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  label: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  summary: { fontSize: 15, lineHeight: 22 },
  action: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  count: { fontSize: 13, marginBottom: 16 },
  disclaimer: { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 24 },
  disclaimerText: { fontSize: 12, lineHeight: 18 },
  actions: { gap: 10 },
  smsBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  smsBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  homeBtn: { borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1 },
  homeBtnText: { fontWeight: '600', fontSize: 15 },
  retakeBtn: { borderWidth: 1, borderRadius: 14, padding: 16, alignItems: 'center' },
  retakeBtnText: { fontWeight: '600', fontSize: 15 },
})
