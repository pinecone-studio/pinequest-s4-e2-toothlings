import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { seasonForDate } from '@pinequest/core'
import { useTheme } from '@/lib/ThemeContext'
import { createClass, type RosterStudentInput } from '@/lib/api'
import { toMongolian } from '@/lib/errorMessages'
import ScreenHeader from '@/components/teacher/ScreenHeader'
import SeasonPicker from '@/components/teacher/SeasonPicker'
import MonthCalendar from '@/components/teacher/MonthCalendar'
import RosterEditor, { emptyStudent } from '@/components/teacher/RosterEditor'
import TextField from '@/components/auth/TextField'
import PrimaryButton from '@/components/auth/PrimaryButton'
import type { EditableStudent } from '@/components/teacher/RosterRow'

const THIS_YEAR = new Date().getFullYear()

const buildRoster = (rows: EditableStudent[]): { students?: RosterStudentInput[]; error?: string } => {
  const students: RosterStudentInput[] = []
  for (const r of rows) {
    const filled = r.firstName.trim() || r.lastName.trim() || r.birthYear.trim() || r.guardianEmail.trim()
    if (!filled) continue
    const year = parseInt(r.birthYear, 10)
    if (!r.firstName.trim() || !r.lastName.trim() || !(year >= 2000 && year <= THIS_YEAR)) {
      return { error: 'Сурагчийн нэр, овог, төрсөн оныг бүрэн бөглөнө үү' }
    }
    students.push({
      rosterSlot: students.length + 1,
      firstName: r.firstName.trim(),
      lastName: r.lastName.trim(),
      birthYear: year,
      guardianEmail: r.guardianEmail.trim() || undefined,
    })
  }
  return { students }
}

const NewClassScreen = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const [seasonId, setSeasonId] = useState(seasonForDate(new Date()))
  const [date, setDate] = useState<Date | null>(null)
  const [showCal, setShowCal] = useState(false)
  const [rows, setRows] = useState<EditableStudent[]>([emptyStudent()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async () => {
    if (!name.trim()) return
    const { students, error: rErr } = buildRoster(rows)
    if (rErr) { setError(rErr); return }
    setLoading(true)
    setError(null)
    try {
      const gradeNum = parseInt(grade, 10)
      await createClass({
        name: name.trim(),
        seasonId,
        gradeLevel: gradeNum > 0 ? gradeNum : undefined,
        scheduledAt: date ? date.toISOString() : undefined,
        students: students ?? [],
      })
      router.replace('/(tabs)/classes')
    } catch (err) {
      setError(toMongolian(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[s.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Шинэ анги" subtitle="Анги болон сурагчдын бүртгэл" />

        <TextField label="АНГИЙН НЭР" value={name} onChange={setName} placeholder="ж: 3A" autoCapitalize="characters" />
        <TextField label="АНГИ (ЗААВАЛ БИШ)" value={grade} onChange={setGrade} placeholder="ж: 3" keyboard="number-pad" />

        <View style={s.block}>
          <Text style={[s.label, { color: colors.textMuted }]}>Улирал</Text>
          <SeasonPicker value={seasonId} onChange={setSeasonId} year={THIS_YEAR} />
        </View>

        <View style={s.block}>
          <Text style={[s.label, { color: colors.textMuted }]}>Хяналт хийх огноо</Text>
          <TouchableOpacity
            style={[s.dateRow, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setShowCal((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={[s.dateText, { color: date ? colors.textBase : colors.textDisabled }]}>
              {date ? date.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Огноо товлох'}
            </Text>
          </TouchableOpacity>
          {showCal ? <MonthCalendar value={date} onChange={(d) => { setDate(d); setShowCal(false) }} /> : null}
        </View>

        <RosterEditor students={rows} onChange={setRows} />

        {error ? <Text style={s.error}>{error}</Text> : null}
        <PrimaryButton label="Анги үүсгэх" onPress={onSubmit} loading={loading} disabled={!name.trim()} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  block: { gap: 8 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  dateRow: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 9999, paddingHorizontal: 14, height: 52, justifyContent: 'center' },
  dateText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  error: { fontSize: 13, color: '#ef4444' },
})

export default NewClassScreen
