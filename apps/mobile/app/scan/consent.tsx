import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

const CONSENT_VERSION = '1.0'

const POINTS = [
  { icon: 'camera-outline' as const, text: 'Хүүхдийн шүдний зураг авч, дижитал шинжилгээнд ашиглана' },
  { icon: 'shield-checkmark-outline' as const, text: 'Нэр, царайны зураг хадгалахгүй — зөвхөн шүдний хэсэг' },
  { icon: 'people-outline' as const, text: 'Дүнг сургуулийн эрүүл мэндийн ажилтан, шүдний эмчтэй хуваалцана' },
  { icon: 'information-circle-outline' as const, text: 'Энэ нь урьдчилсан чиглүүлэг — шүдний эмч эцэслэн батална' },
]

export default function ConsentScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const params = useLocalSearchParams<{
    childKey: string; classId: string; schoolId: string
    seasonId: string; guardianPhone: string; guardianEmail?: string; birthYear?: string
  }>()

  const onAgree = () => {
    router.push({
      pathname: '/scan/questionnaire' as never,
      params: { ...params, consentAt: new Date().toISOString(), consentVersion: CONSENT_VERSION },
    })
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Ionicons name="document-text-outline" size={48} color={colors.primary} style={s.icon} />
        <Text style={[s.title, { color: colors.textBase }]}>Зөвшөөрөл</Text>
        <Text style={[s.subtitle, { color: colors.textMuted }]}>
          Амны хөндийн хяналт эхлэхийн өмнө дараах мэдээллийг анхааралтай уншина уу
        </Text>

        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {POINTS.map((p) => (
            <View key={p.text} style={s.row}>
              <Ionicons name={p.icon} size={20} color={colors.primary} style={s.rowIcon} />
              <Text style={[s.rowText, { color: colors.textBase }]}>{p.text}</Text>
            </View>
          ))}
        </View>

        <Text style={[s.legal, { color: colors.textMuted }]}>
          "Зөвшөөрч байна" товч дарснаар та эдгээр нөхцлийг зөвшөөрч байна гэж үзнэ.
          Хүүхдийн эцэг эх/асран хамгаалагчийн зөвшөөрлийг урьдчилан авав.
        </Text>

        <TouchableOpacity
          style={[s.agreeBtn, { backgroundColor: colors.primary }]}
          onPress={onAgree}
          activeOpacity={0.85}
        >
          <Text style={[s.agreeBtnText, { color: colors.primaryText }]}>Зөвшөөрч байна →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
          <Text style={[s.cancelText, { color: colors.textMuted }]}>Цуцлах</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, gap: 16, paddingBottom: 40 },
  icon: { alignSelf: 'center', marginBottom: 4 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
  card: { borderRadius: 16, padding: 20, gap: 16, borderWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rowIcon: { marginTop: 1, flexShrink: 0 },
  rowText: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  legal: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, textAlign: 'center' },
  agreeBtn: { borderRadius: 9999, padding: 18, alignItems: 'center', marginTop: 8 },
  agreeBtnText: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
})
