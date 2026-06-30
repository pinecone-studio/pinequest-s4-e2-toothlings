import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import { getBoardStudents, type BoardStudent } from '@/lib/api'
import { toMongolian } from '@/lib/errorMessages'

const SEASON_ID = '2026-spring'

type Props = { userId: string }

export default function ParentChildForm({ userId }: Props) {
  const router = useRouter()
  const { colors } = useTheme()

  // Already-registered children (same source as the home "Миний хүүхэд" list).
  const [children, setChildren] = useState<BoardStudent[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  // 'list' = pick a saved child (auto-filled); 'form' = register a brand-new one.
  const [mode, setMode] = useState<'list' | 'form'>('list')

  const [childName, setChildName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [guardianPhone, setGuardianPhone] = useState('')
  const [guardianEmail, setGuardianEmail] = useState('')

  useEffect(() => {
    getBoardStudents()
      .then((kids) => {
        // Dedupe by childKey — one entry per child.
        const seen = new Set<string>()
        const unique = kids.filter((k) => !seen.has(k.childKey) && seen.add(k.childKey))
        setChildren(unique)
        if (unique.length === 0) setMode('form')
      })
      .catch((err) => {
        setError(toMongolian(err))
        setChildren([])
        setMode('form')
      })
  }, [])

  // Saved child → straight to consent with everything pre-filled, no re-typing.
  const onPickChild = (child: BoardStudent) => {
    router.push({
      pathname: '/scan/consent' as never,
      params: {
        childKey: child.childKey,
        classId: child.classId,
        schoolId: child.schoolId,
        seasonId: SEASON_ID,
        guardianPhone: child.guardianPhone ?? '',
        guardianEmail: child.guardianEmail ?? '',
        birthYear: String(child.birthYear),
      },
    })
  }

  const contactFilled = !!guardianPhone.trim() || !!guardianEmail.trim()
  const ready = !!childName.trim() && birthYear.length === 4 && contactFilled

  const onNext = () => {
    if (!ready) return
    const slug = childName.trim().toLowerCase().replace(/\s+/g, '-')
    router.push({
      pathname: '/scan/consent' as never,
      params: { childKey: `parent:${userId}:${slug}`, classId: 'home', schoolId: 'home', seasonId: SEASON_ID, guardianPhone, guardianEmail },
    })
  }

  const inp = [s.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.textBase }]

  if (children === null) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  // Pick from already-registered children — auto-filled, like the class roster.
  if (mode === 'list' && children.length > 0) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Text style={[s.sectionLabel, { color: colors.textMuted }]}>ШАЛГУУЛАГЧ СОНГОХ</Text>
          {children.map((c) => (
            <TouchableOpacity
              key={c.childKey}
              style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => onPickChild(c)}
              activeOpacity={0.8}
            >
              <View style={s.rowText}>
                <Text style={[s.name, { color: colors.textBase }]} numberOfLines={1}>{c.lastName} {c.firstName}</Text>
                <Text style={[s.meta, { color: colors.textMuted }]}>Төрсөн он: {c.birthYear}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={[s.addBtn, { borderColor: colors.border }]} onPress={() => setMode('form')} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={[s.addText, { color: colors.primary }]}>Шинэ хүүхэд нэмэх</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // Register a brand-new child.
  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          {error ? <Text style={[s.error, { color: colors.triageRedText }]}>{error}</Text> : null}
          {children.length > 0 ? (
            <TouchableOpacity style={s.backRow} onPress={() => setMode('list')} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
              <Text style={[s.backText, { color: colors.textMuted }]}>Бүртгэлтэй хүүхэд сонгох</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={[s.label, { color: colors.textMuted }]}>Хүүхдийн нэр</Text>
          <TextInput style={inp} value={childName} onChangeText={setChildName} placeholder="Нэрийг оруулна уу" placeholderTextColor={colors.textDisabled} />
          <Text style={[s.label, { color: colors.textMuted }]}>Төрсөн он</Text>
          <TextInput style={inp} value={birthYear} onChangeText={setBirthYear} placeholder="2015" keyboardType="number-pad" maxLength={4} placeholderTextColor={colors.textDisabled} />
          <Text style={[s.sectionTitle, { color: colors.textBase }]}>Таны холбоо барих <Text style={{ color: colors.primary }}>*</Text></Text>
          <Text style={[s.hint, { color: colors.textMuted }]}>Утас эсвэл и-мэйлийн аль нэгийг заавал бөглөнө</Text>
          <Text style={[s.label, { color: colors.textMuted }]}>Утасны дугаар</Text>
          <TextInput style={inp} value={guardianPhone} onChangeText={setGuardianPhone} placeholder="+976 xxxxxxxx" keyboardType="phone-pad" placeholderTextColor={colors.textDisabled} />
          <Text style={[s.label, { color: colors.textMuted }]}>И-мэйл хаяг</Text>
          <TextInput style={inp} value={guardianEmail} onChangeText={setGuardianEmail} placeholder="example@mail.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textDisabled} />
          <TouchableOpacity style={[s.btn, { backgroundColor: ready ? colors.primary : colors.border }]} onPress={onNext} disabled={!ready}>
            <Text style={[s.btnText, { color: ready ? colors.primaryText : colors.textDisabled }]}>Асуумж эхлэх →</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 6, paddingBottom: 40 },
  error: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 8 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10 },
  rowText: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  meta: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderStyle: 'dashed', paddingVertical: 14, marginTop: 4 },
  addText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  backText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginTop: 12 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', marginTop: 20 },
  hint: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 13, fontSize: 15 },
  btn: { borderRadius: 9999, padding: 16, alignItems: 'center', marginTop: 28 },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 16 },
})
