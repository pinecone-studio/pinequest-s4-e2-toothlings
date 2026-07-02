import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useFocusEffect } from 'expo-router'
import { seasonLabelMn } from '@pinequest/core'
import { useTheme } from '@/lib/ThemeContext'
import { getClass, getRosterStatus, addStudents, getAppointments, type ClassMeta, type RosterStatusRow, type RosterAppendInput, type AppointmentListItem } from '@/lib/api'
import { toMongolian } from '@/lib/errorMessages'
import { shortChildName } from '@/lib/childName'
import { slotLabel } from '@/lib/appointmentSlots'
import { callDentist } from '@/lib/call'
import ScreenHeader from '@/components/teacher/ScreenHeader'
import CoverageBar from '@/components/teacher/CoverageBar'
import TriageBadge from '@/components/teacher/TriageBadge'
import RedStudentsSection from '@/components/teacher/RedStudentsSection'
import RosterEditor, { emptyStudent } from '@/components/teacher/RosterEditor'
import PrimaryButton from '@/components/auth/PrimaryButton'
import type { EditableStudent } from '@/components/teacher/RosterRow'

const THIS_YEAR = new Date().getFullYear()

const buildStudents = (rows: EditableStudent[]): { students?: RosterAppendInput[]; error?: string } => {
  const students: RosterAppendInput[] = []
  for (const r of rows) {
    const filled = r.firstName.trim() || r.lastName.trim() || r.birthYear.trim() || r.guardianEmail.trim()
    if (!filled) continue
    const year = parseInt(r.birthYear, 10)
    if (!r.firstName.trim() || !r.lastName.trim() || !(year >= 2000 && year <= THIS_YEAR)) {
      return { error: 'Сурагчийн нэр, овог, төрсөн оныг бүрэн бөглөнө үү' }
    }
    students.push({
      firstName: r.firstName.trim(),
      lastName: r.lastName.trim(),
      birthYear: year,
      guardianEmail: r.guardianEmail.trim() || undefined,
    })
  }
  if (!students.length) return { error: 'Дор хаяж нэг сурагч нэмнэ үү' }
  return { students }
}

const ClassDetailScreen = () => {
  const { colors } = useTheme()
  const { id, add } = useLocalSearchParams<{ id: string; add?: string }>()
  const [meta, setMeta] = useState<ClassMeta | null>(null)
  const [roster, setRoster] = useState<RosterStatusRow[] | null>(null)
  const [appts, setAppts] = useState<AppointmentListItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const [showAdd, setShowAdd] = useState(false)
  const [rows, setRows] = useState<EditableStudent[]>([emptyStudent()])
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // The red child a teacher tapped to see/join their booked video call.
  const [callChild, setCallChild] = useState<RosterStatusRow | null>(null)

  const load = useCallback((id: string) => {
    setError(null)
    // Appointments are best-effort (the join card); don't fail the roster on them.
    getAppointments().then(setAppts).catch(() => setAppts([]))
    return Promise.all([getClass(id), getRosterStatus(id)])
      .then(([m, r]) => { setMeta(m); setRoster(r) })
      .catch((err) => setError(toMongolian(err)))
  }, [])

  // NOTE (testing): the 15s "now" ticker + time-gating were temporarily removed so the
  // call button is always active. To restore, re-add a `now` state ticking here and set
  // `canJoin` back to `!!at && now >= at.getTime()`.

  // Latest booked (non-cancelled) call for a child, by childKey.
  const apptFor = useCallback(
    (childKey: string): AppointmentListItem | null =>
      appts
        .filter((a) => a.childKey === childKey && a.status !== 'cancelled')
        .sort((a, b) => b.scheduledAt - a.scheduledAt)[0] ?? null,
    [appts],
  )

  useFocusEffect(useCallback(() => { void load(id); return () => {} }, [id, load]))

  // Deep-linked from the Class tab's "+" (the teacher's existing class): open the
  // add-students sheet immediately so they just add students, never re-create the class.
  useEffect(() => {
    if (add === '1') { setRows([emptyStudent()]); setAddError(null); setShowAdd(true) }
  }, [add])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    load(id).finally(() => setRefreshing(false))
  }, [id, load])

  const openAdd = () => {
    setRows([emptyStudent()])
    setAddError(null)
    setShowAdd(true)
  }

  const onSaveStudents = async () => {
    const { students, error: bErr } = buildStudents(rows)
    if (bErr) { setAddError(bErr); return }
    setSaving(true)
    setAddError(null)
    try {
      await addStudents(id, students ?? [])
      setShowAdd(false)
      await load(id)
    } catch (err) {
      setAddError(toMongolian(err))
    } finally {
      setSaving(false)
    }
  }

  const screened = roster?.filter((r) => r.screenedAt).length ?? 0
  const redCount = roster?.filter((r) => r.latestLevel === 'red').length ?? 0
  const yellowCount = roster?.filter((r) => r.latestLevel === 'yellow').length ?? 0

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]}>
      <View style={s.headWrap}>
        <ScreenHeader title={meta?.name ?? 'Анги'} subtitle={meta ? seasonLabelMn(meta.seasonId) : undefined} />
      </View>
      {roster === null && !error ? (
        <View style={s.center}><ActivityIndicator color={colors.primary} /></View>
      ) : error ? (
        <View style={s.center}><Text style={[s.muted, { color: colors.textMuted }]}>{error}</Text></View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <CoverageBar screened={screened} enrolled={roster?.length ?? 0} label="Хяналтын хамрагдалт" />
            <View style={s.stats}>
              <Stat label="Улаан" value={redCount} tone={colors.triageRedText} colors={colors} />
              <Stat label="Шар" value={yellowCount} tone={colors.triageYellowText} colors={colors} />
              <Stat label="Шалгасан" value={screened} tone={colors.triageGreenText} colors={colors} />
            </View>
          </View>

          {roster ? <RedStudentsSection roster={roster} /> : null}

          <View style={s.sectionRow}>
            <Text style={[s.section, { color: colors.textMuted }]}>СУРАГЧИД</Text>
            <TouchableOpacity style={[s.addBtn, { borderColor: colors.primary }]} onPress={openAdd} activeOpacity={0.7}>
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={[s.addBtnText, { color: colors.primary }]}>Сурагч нэмэх</Text>
            </TouchableOpacity>
          </View>
          {roster && roster.length === 0 ? (
            <Text style={[s.muted, { color: colors.textMuted }]}>Энэ ангид сурагч бүртгэгдээгүй байна.</Text>
          ) : (
            roster?.map((r) => {
              const isRed = r.latestLevel === 'red'
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  activeOpacity={isRed ? 0.7 : 1}
                  onPress={isRed ? () => setCallChild(r) : undefined}
                  disabled={!isRed}
                >
                  <Text style={[s.slot, { color: colors.textMuted }]}>{r.rosterSlot}</Text>
                  <Text style={[s.name, { color: colors.textBase }]} numberOfLines={1}>{shortChildName(r.lastName, r.firstName)}</Text>
                  {r.transferredIn ? (
                    <View style={[s.transferTag, { backgroundColor: colors.primary + '22' }]}>
                      <Ionicons name="swap-horizontal" size={12} color={colors.primary} />
                      <Text style={[s.transferTagText, { color: colors.primary }]}>Шилжсэн</Text>
                    </View>
                  ) : null}
                  {isRed ? <Ionicons name="videocam" size={16} color={colors.triageRedText} /> : null}
                  <TriageBadge level={r.latestLevel} />
                </TouchableOpacity>
              )
            })
          )}
        </ScrollView>
      )}

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={s.backdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.sheetWrap}>
            <View style={[s.sheet, { backgroundColor: colors.bg }]}>
              <View style={s.sheetHead}>
                <Text style={[s.sheetTitle, { color: colors.textBase }]}>Сурагч нэмэх</Text>
                <TouchableOpacity onPress={() => setShowAdd(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView
                contentContainerStyle={s.sheetScroll}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
              >
                <RosterEditor students={rows} onChange={setRows} />
                {addError ? <Text style={[s.error, { color: colors.triageRedText }]}>{addError}</Text> : null}
                <PrimaryButton label="Хадгалах" onPress={onSaveStudents} loading={saving} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={!!callChild} transparent animationType="slide" onRequestClose={() => setCallChild(null)}>
        <View style={s.backdrop}>
          <View style={[s.callSheet, { backgroundColor: colors.bg }]}>
            <View style={s.sheetHead}>
              <Text style={[s.sheetTitle, { color: colors.textBase }]}>Яаралтай эмчилгээ</Text>
              <TouchableOpacity onPress={() => setCallChild(null)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {(() => {
              if (!callChild) return null
              const appt = apptFor(callChild.childKey)
              const at = appt ? new Date(appt.scheduledAt) : null
              // TEMP (testing): always active when booked, ignoring the scheduled time.
              // Revert to `!!at && now >= at.getTime()` to re-enable time-gating.
              const canJoin = !!appt
              return (
                <View style={s.callBody}>
                  <Text style={[s.callName, { color: colors.textBase }]}>
                    {shortChildName(callChild.lastName, callChild.firstName)}
                  </Text>
                  {appt && at ? (
                    <>
                      <View style={[s.timeRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="time-outline" size={18} color={colors.textMuted} />
                        <View style={s.timeInfo}>
                          <Text style={[s.timeLabel, { color: colors.textMuted }]}>Товлосон цаг</Text>
                          <Text style={[s.timeValue, { color: colors.textBase }]}>{slotLabel(at)}</Text>
                        </View>
                        {appt.dentistName ? (
                          <Text style={[s.dentist, { color: colors.textMuted }]} numberOfLines={1}>{appt.dentistName}</Text>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        style={[s.callBtn, { backgroundColor: canJoin ? colors.triageRedText : colors.surfaceRaised, borderColor: colors.border }]}
                        onPress={() => canJoin && callDentist(appt.dentistUserId, shortChildName(callChild.lastName, callChild.firstName))}
                        disabled={!canJoin}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="videocam" size={18} color={canJoin ? '#fff' : colors.textDisabled} />
                        <Text style={[s.callBtnText, { color: canJoin ? '#fff' : colors.textDisabled }]}>Дуудлага хийх</Text>
                      </TouchableOpacity>
                      {!canJoin ? (
                        <Text style={[s.callHint, { color: colors.textMuted }]}>
                          Товлосон цаг болмогц “Дуудлага хийх” идэвхжинэ.
                        </Text>
                      ) : null}
                    </>
                  ) : (
                    <Text style={[s.callHint, { color: colors.textMuted }]}>
                      Энэ хүүхдэд видео дуудлагын цаг захиалаагүй байна. Скрининг дуусмагц эмчтэй цаг захиална.
                    </Text>
                  )}
                </View>
              )
            })()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const Stat = ({ label, value, tone, colors }: { label: string; value: number; tone: string; colors: { textMuted: string } }) => (
  <View style={s.stat}>
    <Text style={[s.statValue, { color: tone }]}>{value}</Text>
    <Text style={[s.statLabel, { color: colors.textMuted }]}>{label}</Text>
  </View>
)

const s = StyleSheet.create({
  safe: { flex: 1 },
  headWrap: { paddingHorizontal: 20, paddingTop: 8 },
  scroll: { padding: 20, paddingTop: 8, gap: 12, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 16 },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  section: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  addBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingVertical: 12 },
  slot: { fontSize: 13, fontFamily: 'Inter_600SemiBold', width: 22 },
  name: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  transferTag: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999 },
  transferTagText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  muted: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheetWrap: { maxHeight: '88%' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 18 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  sheetTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  sheetScroll: { padding: 20, paddingTop: 4, gap: 16, paddingBottom: 32 },
  error: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  callSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 18, paddingBottom: 32 },
  callBody: { paddingHorizontal: 20, paddingTop: 4, gap: 14 },
  callName: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 14 },
  timeInfo: { flex: 1, gap: 2 },
  timeLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  timeValue: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  dentist: { fontSize: 12, fontFamily: 'Inter_500Medium', flexShrink: 1 },
  callBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 9999, borderWidth: StyleSheet.hairlineWidth },
  callBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  callHint: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 19 },
})

export default ClassDetailScreen
