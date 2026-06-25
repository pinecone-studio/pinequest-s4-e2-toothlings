import { Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'

const CURRENT_YEAR = new Date().getFullYear()

export default function ScanChildScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const [schoolId, setSchoolId] = useState('')
  const [classId, setClassId] = useState('')
  const [seasonId, setSeasonId] = useState('2026-spring')
  const [rosterSlot, setRosterSlot] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [guardianPhone, setGuardianPhone] = useState('')

  const isAdult = !!birthYear && (CURRENT_YEAR - parseInt(birthYear, 10)) >= 18
  const ready = !!schoolId && !!classId && !!rosterSlot && birthYear.length === 4

  const onNext = () => {
    if (!ready) return
    const childKey = `${schoolId}:${classId}:${rosterSlot}`
    // cast: Expo Router types regenerate on next `expo start`; file exists at app/scan/questionnaire.tsx
    router.push({
      pathname: '/scan/questionnaire' as never,
      params: { childKey, classId, schoolId, seasonId, isAdult: String(isAdult), guardianPhone },
    })
  }

  const inp = [s.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.textBase }]

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        <Text style={[s.label, { color: colors.textMuted }]}>Сургуулийн ID</Text>
        <TextInput style={inp} value={schoolId} onChangeText={setSchoolId} placeholder="school-001" autoCapitalize="none" placeholderTextColor={colors.textDisabled} />

        <Text style={[s.label, { color: colors.textMuted }]}>Ангийн ID</Text>
        <TextInput style={inp} value={classId} onChangeText={setClassId} placeholder="class-3a" autoCapitalize="none" placeholderTextColor={colors.textDisabled} />

        <Text style={[s.label, { color: colors.textMuted }]}>Улирал</Text>
        <TextInput style={inp} value={seasonId} onChangeText={setSeasonId} placeholder="2026-spring" autoCapitalize="none" placeholderTextColor={colors.textDisabled} />

        <Text style={[s.label, { color: colors.textMuted }]}>Суудлын дугаар</Text>
        <TextInput style={inp} value={rosterSlot} onChangeText={setRosterSlot} placeholder="1" keyboardType="number-pad" placeholderTextColor={colors.textDisabled} />

        <Text style={[s.label, { color: colors.textMuted }]}>Төрсөн он</Text>
        <TextInput style={inp} value={birthYear} onChangeText={setBirthYear} placeholder="2015" keyboardType="number-pad" maxLength={4} placeholderTextColor={colors.textDisabled} />

        {birthYear.length === 4 && (
          <Text style={[s.ageHint, { color: isAdult ? colors.triageYellowText : colors.primary }]}>
            {isAdult ? '18+ насны асуулга' : 'Хүүхдийн асуулга'}
          </Text>
        )}

        <Text style={[s.label, { color: colors.textMuted }]}>Эцэг эхийн утасны дугаар (заавал биш)</Text>
        <TextInput style={inp} value={guardianPhone} onChangeText={setGuardianPhone} placeholder="+976 xxxxxxxx" keyboardType="phone-pad" placeholderTextColor={colors.textDisabled} />

        <TouchableOpacity
          style={[s.btn, { backgroundColor: ready ? colors.primary : colors.border }]}
          onPress={onNext}
          disabled={!ready}
        >
          <Text style={[s.btnText, { color: ready ? '#fff' : colors.textDisabled }]}>Асуулга эхлэх →</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, gap: 6 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 15 },
  ageHint: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 28 },
  btnText: { fontWeight: '700', fontSize: 16 },
})
