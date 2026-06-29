import { useCallback, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { seasonLabelMn } from '@pinequest/core'
import { useTheme } from '@/lib/ThemeContext'
import { getMyClasses, updateSchedule, type TeacherClass } from '@/lib/api'
import { scheduleScreeningReminder, syncScreeningReminders } from '@/lib/notifications'
import { toMongolian } from '@/lib/errorMessages'
import MonthCalendar from '@/components/teacher/MonthCalendar'

const startOfDay = (d: string | Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
// Standard numeric date: YYYY.MM.DD (device-independent, no verbose month names).
const fmt = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const CalendarScreen = () => {
  const { colors } = useTheme()
  const [classes, setClasses] = useState<TeacherClass[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(() => {
    setError(null)
    getMyClasses()
      .then((list) => { setClasses(list); void syncScreeningReminders(list) })
      .catch((e) => setError(toMongolian(e)))
  }, [])
  useFocusEffect(useCallback(() => { load() }, [load]))

  const pick = async (k: TeacherClass, date: Date) => {
    setSavingId(k.id); setOpenId(null)
    try {
      await updateSchedule(k.id, date.toISOString(), k.reminderPhone)
      // Local reminder the day before at 15:00 — fires even with no signal.
      await scheduleScreeningReminder({ id: k.id, name: k.name, scheduledAt: date.toISOString() })
      load()
    }
    catch (e) { setError(toMongolian(e)) } finally { setSavingId(null) }
  }

  const today = startOfDay(new Date())
  const list = classes ?? []
  const overdue = list.filter((k) => k.scheduledAt && startOfDay(k.scheduledAt) < today).length
  const unscheduled = list.filter((k) => !k.scheduledAt).length
  const alerts = overdue + unscheduled

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]}>
      <View style={s.head}>
        <Text style={[s.title, { color: colors.textBase }]}>Хуанли</Text>
        <View style={s.bell}>
          <Ionicons name="notifications-outline" size={22} color={alerts ? colors.primary : colors.textMuted} />
          {alerts > 0 && <View style={[s.dot, { backgroundColor: colors.triageRedText }]}><Text style={s.dotText}>{alerts}</Text></View>}
        </View>
      </View>

      {classes === null && !error ? (
        <View style={s.center}><ActivityIndicator color={colors.primary} /></View>
      ) : error ? (
        <View style={s.center}><Text style={[s.muted, { color: colors.textMuted }]}>{error}</Text></View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {alerts > 0 && (
            <View style={[s.alert, { backgroundColor: colors.triageRedBg }]}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.triageRedText} />
              <Text style={[s.alertText, { color: colors.triageRedText }]}>
                {overdue ? `${overdue} ангийн хяналт хийх хугацаа хэтэрсэн. ` : ''}{unscheduled ? `${unscheduled} анги товлоогүй.` : ''}
              </Text>
            </View>
          )}
          <Text style={[s.hint, { color: colors.textMuted }]}>Улирал бүр (намар/өвөл/хавар) дор хаяж нэг удаа хяналт хийнэ үү.</Text>

          {list.map((k) => {
            const over = k.scheduledAt && startOfDay(k.scheduledAt) < today
            return (
              <View key={k.id} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={s.cardTop}>
                  <View style={s.cardInfo}>
                    <Text style={[s.cardName, { color: colors.textBase }]}>{k.name}</Text>
                    <Text style={[s.cardSeason, { color: colors.textMuted }]}>{seasonLabelMn(k.seasonId)}</Text>
                  </View>
                  <Text style={[s.cardDate, { color: over ? colors.triageRedText : k.scheduledAt ? colors.textBase : colors.textMuted }]}>
                    {k.scheduledAt ? fmt(k.scheduledAt) : 'Товлоогүй'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[s.pickBtn, { borderColor: colors.primary }]}
                  onPress={() => setOpenId(openId === k.id ? null : k.id)}
                  disabled={savingId === k.id}
                >
                  {savingId === k.id
                    ? <ActivityIndicator size="small" color={colors.primary} />
                    : <Text style={[s.pickText, { color: colors.primary }]}>{k.scheduledAt ? 'Огноо өөрчлөх' : 'Огноо товлох'}</Text>}
                </TouchableOpacity>
                {openId === k.id && (
                  <MonthCalendar value={k.scheduledAt ? new Date(k.scheduledAt) : null} onChange={(d) => pick(k, d)} />
                )}
              </View>
            )
          })}
          {list.length === 0 && <Text style={[s.muted, { color: colors.textMuted }]}>Анги бүртгээгүй байна.</Text>}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.4 },
  bell: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 2, right: 0, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  dotText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold' },
  scroll: { paddingHorizontal: 20, paddingBottom: 28, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  alert: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 12 },
  alertText: { flex: 1, fontSize: 12, fontFamily: 'Inter_500Medium' },
  hint: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  cardInfo: { gap: 2 },
  cardName: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  cardSeason: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  cardDate: { fontSize: 13, fontFamily: 'Inter_600SemiBold', textAlign: 'right', flexShrink: 1 },
  pickBtn: { borderWidth: 1, borderRadius: 9999, paddingVertical: 11, alignItems: 'center' },
  pickText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  muted: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
})

export default CalendarScreen
