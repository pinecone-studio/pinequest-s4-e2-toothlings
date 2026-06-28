import { Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'

const SEASON_ID = '2026-spring'

type Props = { userId: string }

export default function ParentChildForm({ userId }: Props) {
  const router = useRouter()
  const { colors } = useTheme()
  const [childName, setChildName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [guardianPhone, setGuardianPhone] = useState('')
  const [guardianEmail, setGuardianEmail] = useState('')

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

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <Text style={[s.label, { color: colors.textMuted }]}>Хүүхдийн нэр</Text>
          <TextInput style={inp} value={childName} onChangeText={setChildName} placeholder="Нэрийг оруулна уу" placeholderTextColor={colors.textDisabled} />
          <Text style={[s.label, { color: colors.textMuted }]}>Төрсөн он</Text>
          <TextInput style={inp} value={birthYear} onChangeText={setBirthYear} placeholder="2015" keyboardType="number-pad" maxLength={4} placeholderTextColor={colors.textDisabled} />
          <Text style={[s.sectionLabel, { color: colors.textBase }]}>Таны холбоо барих <Text style={{ color: colors.primary }}>*</Text></Text>
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
  content: { padding: 20, gap: 6, paddingBottom: 40 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginTop: 12 },
  sectionLabel: { fontSize: 15, fontFamily: 'Inter_700Bold', marginTop: 20 },
  hint: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  input: { borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 15 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 28 },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 16 },
})
