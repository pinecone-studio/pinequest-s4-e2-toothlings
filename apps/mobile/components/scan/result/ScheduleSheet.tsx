import { useMemo, useState } from 'react'
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Linking, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import { buildSlots, slotLabel } from '@/lib/appointmentSlots'
import { createAppointment, type VolunteerDentist, type Appointment } from '@/lib/api'

type Props = { dentist: VolunteerDentist | null; childKey: string; onClose: () => void }

// Pick a time → book the appointment (backend) → join the Jitsi video call.
const ScheduleSheet = ({ dentist, childKey, onClose }: Props) => {
  const { colors } = useTheme()
  const slots = useMemo(() => buildSlots(), [])
  const [picked, setPicked] = useState<Date | null>(null)
  const [booking, setBooking] = useState(false)
  const [appt, setAppt] = useState<Appointment | null>(null)
  const [error, setError] = useState<string | null>(null)

  const book = async () => {
    if (!dentist || !picked) return
    setBooking(true); setError(null)
    try {
      const res = await createAppointment(dentist.id, childKey, picked.toISOString(), 'red')
      setAppt(res)
    } catch {
      setError('Захиалга амжилтгүй боллоо. Холболтоо шалгаад дахин оролдоно уу.')
    } finally {
      setBooking(false)
    }
  }

  const close = () => { setPicked(null); setAppt(null); setError(null); onClose() }

  return (
    <Modal visible={!!dentist} transparent animationType="slide" onRequestClose={close}>
      <View style={s.backdrop}>
        <View style={[s.sheet, { backgroundColor: colors.surface }]}>
          <View style={s.grabber} />
          {dentist && !appt && (
            <>
              <Text style={[s.title, { color: colors.textBase }]}>{dentist.displayName}</Text>
              <Text style={[s.sub, { color: colors.textMuted }]}>Видео дуудлагын цаг сонгоно уу</Text>
              <View style={s.slots}>
                {slots.map((d) => {
                  const on = picked?.getTime() === d.getTime()
                  return (
                    <TouchableOpacity
                      key={d.toISOString()}
                      style={[s.slot, { borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primarySoft : colors.surface }]}
                      onPress={() => setPicked(d)}
                    >
                      <Text style={[s.slotText, { color: on ? colors.textBase : colors.textSecondary }]}>{slotLabel(d)}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
              {!!error && <Text style={[s.err, { color: colors.triageRedText }]}>{error}</Text>}
              <TouchableOpacity
                style={[s.cta, { backgroundColor: colors.primary, opacity: picked && !booking ? 1 : 0.5 }]}
                onPress={book}
                disabled={!picked || booking}
              >
                {booking ? <ActivityIndicator color={colors.primaryText} /> : <Text style={[s.ctaText, { color: colors.primaryText }]}>Цаг захиалах</Text>}
              </TouchableOpacity>
            </>
          )}
          {appt && (
            <>
              <Text style={[s.title, { color: colors.textBase }]}>Цаг баталгаажлаа ✅</Text>
              <Text style={[s.sub, { color: colors.textMuted }]}>
                {dentist?.displayName} · {slotLabel(new Date(appt.scheduledAt))}
              </Text>
              <TouchableOpacity style={[s.cta, { backgroundColor: colors.triageRedText }]} onPress={() => Linking.openURL(appt.roomUrl)}>
                <Text style={[s.ctaText, { color: '#fff' }]}>🎥 Видео дуудлага эхлүүлэх</Text>
              </TouchableOpacity>
              <Text style={[s.note, { color: colors.textMuted }]}>Дуудлага шифрлэгдсэн. Эмчид зургаа хуваалцана.</Text>
            </>
          )}
          <TouchableOpacity style={s.closeBtn} onPress={close}>
            <Text style={[s.closeText, { color: colors.textMuted }]}>Хаах</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, gap: 6 },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.3)', marginBottom: 10 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 13, marginBottom: 8 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  slot: { borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  slotText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  err: { fontFamily: 'Inter_400Regular', fontSize: 12, marginVertical: 4 },
  cta: { borderRadius: 9999, padding: 16, alignItems: 'center', marginTop: 10 },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  note: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', marginTop: 8 },
  closeBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  closeText: { fontFamily: 'Inter_500Medium', fontSize: 14 },
})

export default ScheduleSheet
