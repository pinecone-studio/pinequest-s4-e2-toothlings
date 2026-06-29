import { useEffect, useState } from 'react'
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import { getMyClasses, getRosterStatus, type TeacherClass, type RosterStatusRow } from '@/lib/api'
import { toMongolian } from '@/lib/errorMessages'

const CONSENT_VERSION = '1.0'

const CONSENT_POINTS = [
  { icon: 'camera-outline' as const, text: 'Хүүхдийн шүдний зураг авч, дижитал шинжилгээнд ашиглана' },
  { icon: 'shield-checkmark-outline' as const, text: 'Нэр, царайны зураг хадгалахгүй — зөвхөн шүдний хэсэг' },
  { icon: 'people-outline' as const, text: 'Дүнг сургуулийн эрүүл мэндийн ажилтан, шүдний эмчтэй хуваалцана' },
  { icon: 'information-circle-outline' as const, text: 'Энэ нь урьдчилсан чиглүүлэг — шүдний эмч эцэслэн батална' },
]

export default function TeacherChildForm() {
  const router = useRouter()
  const { colors } = useTheme()

  const [classes, setClasses] = useState<TeacherClass[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null)
  const [roster, setRoster] = useState<RosterStatusRow[] | null>(null)
  const [rosterLoading, setRosterLoading] = useState(false)
  const [pendingChild, setPendingChild] = useState<RosterStatusRow | null>(null)

  useEffect(() => {
    getMyClasses()
      .then((cs) => {
        setClasses(cs)
        if (cs.length === 1) setSelectedClass(cs[0])
      })
      .catch((err) => setError(toMongolian(err)))
  }, [])

  useEffect(() => {
    if (!selectedClass) {
      setRoster(null)
      return
    }
    setRosterLoading(true)
    setRoster(null)
    getRosterStatus(selectedClass.id)
      .then(setRoster)
      .catch((err) => setError(toMongolian(err)))
      .finally(() => setRosterLoading(false))
  }, [selectedClass])

  const startScreening = () => {
    if (!pendingChild || !selectedClass) return
    const child = pendingChild
    setPendingChild(null)
    router.push({
      pathname: '/scan/questionnaire' as never,
      params: {
        childKey: child.childKey,
        classId: selectedClass.id,
        schoolId: selectedClass.schoolId,
        seasonId: selectedClass.seasonId,
        guardianPhone: child.guardianPhone ?? '',
        guardianEmail: child.guardianEmail ?? '',
        birthYear: String(child.birthYear),
        consentAt: new Date().toISOString(),
        consentVersion: CONSENT_VERSION,
      },
    })
  }

  if (classes === null && !error) {
    return (
      <SafeAreaView edges={['bottom']} style={[s.root, { backgroundColor: colors.bg }]}>
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (classes !== null && classes.length === 0) {
    return (
      <SafeAreaView edges={['bottom']} style={[s.root, { backgroundColor: colors.bg }]}>
        <View style={s.center}>
          <Ionicons name="school-outline" size={40} color={colors.textDisabled} />
          <Text style={[s.empty, { color: colors.textMuted }]}>
            Анги бүртгээгүй байна.{'\n'}Эхлээд анги, сурагчдаа нэмнэ үү.
          </Text>
          <TouchableOpacity
            style={[s.linkBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/class/new' as never)}
          >
            <Text style={[s.linkBtnText, { color: colors.primaryText }]}>Анги нэмэх</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['bottom']} style={[s.root, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {error ? <Text style={[s.error, { color: colors.triageRedText }]}>{error}</Text> : null}

        <Text style={[s.sectionLabel, { color: colors.textMuted }]}>АНГИ СОНГОХ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
          {classes?.map((k) => {
            const active = selectedClass?.id === k.id
            return (
              <TouchableOpacity
                key={k.id}
                style={[
                  s.chip,
                  { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : colors.surface },
                ]}
                onPress={() => setSelectedClass(k)}
              >
                <Text style={[s.chipText, { color: active ? colors.primaryText : colors.textBase }]}>{k.name}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {selectedClass ? (
          <>
            <Text style={[s.sectionLabel, { color: colors.textMuted, marginTop: 22 }]}>СУРАГЧ СОНГОХ</Text>
            {rosterLoading ? (
              <View style={s.rosterLoading}><ActivityIndicator color={colors.primary} /></View>
            ) : roster && roster.length === 0 ? (
              <Text style={[s.empty, { color: colors.textMuted }]}>Энэ ангид сурагч бүртгэгдээгүй байна.</Text>
            ) : (
              roster?.map((r) => {
                const screened = !!r.screenedAt
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setPendingChild(r)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.slot, { color: colors.textMuted }]}>{r.rosterSlot}</Text>
                    <Text style={[s.name, { color: colors.textBase }]} numberOfLines={1}>{r.lastName} {r.firstName}</Text>
                    {screened ? (
                      <Ionicons name="checkmark-circle" size={18} color={colors.triageGreenText} />
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
                    )}
                  </TouchableOpacity>
                )
              })
            )}
          </>
        ) : null}
      </ScrollView>

      <Modal
        visible={!!pendingChild}
        transparent
        animationType="slide"
        onRequestClose={() => setPendingChild(null)}
      >
        <View style={s.backdrop}>
          <View style={[s.sheet, { backgroundColor: colors.bg }]}>
            <Ionicons name="document-text-outline" size={40} color={colors.primary} style={s.sheetIcon} />
            <Text style={[s.sheetTitle, { color: colors.textBase }]}>Зөвшөөрөл</Text>
            <Text style={[s.sheetSub, { color: colors.textMuted }]}>
              {pendingChild ? `${pendingChild.lastName} ${pendingChild.firstName}` : ''}
            </Text>

            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {CONSENT_POINTS.map((p) => (
                <View key={p.text} style={s.pointRow}>
                  <Ionicons name={p.icon} size={20} color={colors.primary} style={s.pointIcon} />
                  <Text style={[s.pointText, { color: colors.textBase }]}>{p.text}</Text>
                </View>
              ))}
            </View>

            <Text style={[s.legal, { color: colors.textMuted }]}>
              «Зөвшөөрч байна» товч дарснаар та эдгээр нөхцлийг зөвшөөрч байна гэж үзнэ.
              Хүүхдийн эцэг эх/асран хамгаалагчийн зөвшөөрлийг урьдчилан авсан байх ёстой.
            </Text>

            <TouchableOpacity style={[s.agreeBtn, { backgroundColor: colors.primary }]} onPress={startScreening} activeOpacity={0.85}>
              <Text style={[s.agreeBtnText, { color: colors.primaryText }]}>Зөвшөөрч байна →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setPendingChild(null)}>
              <Text style={[s.cancelText, { color: colors.textMuted }]}>Цуцлах</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, paddingTop: 12, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 30 },
  error: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 8 },
  empty: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 21, marginTop: 8 },
  linkBtn: { borderRadius: 9999, paddingHorizontal: 20, paddingVertical: 12, marginTop: 4 },
  linkBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 10 },
  chipRow: { gap: 8, paddingRight: 8 },
  chip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  chipText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  rosterLoading: { paddingVertical: 24, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10 },
  slot: { fontSize: 13, fontFamily: 'Inter_600SemiBold', width: 22 },
  name: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, gap: 12 },
  sheetIcon: { alignSelf: 'center' },
  sheetTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  sheetSub: { fontSize: 15, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  card: { borderRadius: 16, padding: 18, gap: 14, borderWidth: 1, marginTop: 4 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  pointIcon: { marginTop: 1, flexShrink: 0 },
  pointText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21 },
  legal: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 19, textAlign: 'center' },
  agreeBtn: { borderRadius: 9999, padding: 17, alignItems: 'center', marginTop: 4 },
  agreeBtnText: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  cancelBtn: { alignItems: 'center', padding: 10 },
  cancelText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
})
