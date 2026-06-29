'use client'

import { useMemo, useState } from 'react'
import { VideoCameraIcon } from '@heroicons/react/24/solid'
import Modal from '@/components/ui/Modal'
import { buildSlots, slotLabel } from '@/lib/appointmentSlots'
import { useCreateAppointment, type VolunteerDentist } from '@/hooks/useHelp'
import { useDentistSlots } from '@/hooks/useAppointments'
import { useCall } from '@/context/IncomingCallContext'

type Props = {
  dentist: VolunteerDentist | null
  student?: { childKey: string; name: string } | null
  level?: 'red' | 'yellow'
  onClose: () => void
}

// Shows the dentist's availability (booked slots disabled). A user can book a free
// time (if a student is picked) OR call the dentist directly — no admin step needed.
const ScheduleDentistModal = ({ dentist, student, level = 'red', onClose }: Props) => {
  const slots = useMemo(() => buildSlots(), [])
  const { data: booked = [] } = useDentistSlots(dentist?.id ?? null)
  const { startCall } = useCall()
  const create = useCreateAppointment()
  const [picked, setPicked] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const unavail = useMemo(() => new Map(booked.map((b) => [b.scheduledAt, b.kind])), [booked])

  const close = () => { setPicked(null); setError(null); setDone(null); onClose() }
  const callNow = () => { if (dentist) { onClose(); void startCall(dentist.userId, dentist.displayName) } }
  const book = async () => {
    if (!dentist || !picked || !student) return
    setError(null)
    try {
      await create.mutateAsync({ dentistId: dentist.id, childKey: student.childKey, scheduledAt: picked.toISOString(), level })
      setDone(slotLabel(picked))
    } catch { setError('Захиалга амжилтгүй боллоо. Дахин оролдоно уу.') }
  }

  if (!dentist) return null

  return (
    <Modal open onClose={close} title={dentist.displayName} subtitle={student ? `${student.name} — цаг товлох эсвэл шууд дуудах` : 'Эмчийн боломжит цаг'} size="lg">
      {done ? (
        <div className="text-center">
          <p className="text-[15px] font-semibold text-text-base">Цаг баталгаажлаа ✅</p>
          <p className="mt-1 text-[13px] text-text-muted">{dentist.displayName} · {done}</p>
          <button onClick={callNow} className="mt-5 w-full rounded-full bg-triage-red py-3 text-[14px] font-semibold text-white transition hover:opacity-90">🎥 Одоо дуудах</button>
        </div>
      ) : (
        <>
          <button onClick={callNow} className="flex w-full items-center justify-center gap-2 rounded-full bg-triage-red py-3 text-[14px] font-semibold text-white transition hover:opacity-90">
            <VideoCameraIcon className="size-5" /> Шууд видео дуудлага хийх
          </button>

          <p className="mb-2 mt-5 text-[13px] font-semibold text-text-base">Эмчийн цагийн хуваарь</p>
          <div className="flex flex-wrap gap-2">
            {slots.map((d) => {
              const taken = unavail.get(d.getTime())
              const on = picked?.getTime() === d.getTime()
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  disabled={!!taken || !student}
                  onClick={() => setPicked(d)}
                  className={`rounded-xl border px-3.5 py-2 text-[13px] font-medium transition ${
                    taken ? 'cursor-not-allowed border-border bg-surface-raised text-text-muted line-through opacity-60'
                    : on ? 'border-primary bg-primary-subtle text-text-base'
                    : student ? 'border-border bg-surface text-text-muted hover:border-primary'
                    : 'cursor-default border-border bg-surface text-text-muted'
                  }`}
                >
                  {slotLabel(d)}{taken === 'blocked' ? ' · блок' : taken === 'booked' ? ' · захиалагдсан' : ''}
                </button>
              )
            })}
          </div>
          {!student && <p className="mt-2 text-[11px] text-text-muted">Цаг товлохын тулд сурагч сонгоно уу — эсвэл дээрээс шууд дуудаж болно.</p>}
          {error && <p className="mt-3 text-[12px] text-triage-red">{error}</p>}
          {student && (
            <button onClick={book} disabled={!picked || create.isPending} className="mt-5 w-full rounded-full bg-primary py-3 text-[14px] font-semibold text-text-on-primary transition hover:bg-primary-hover disabled:opacity-50">
              {create.isPending ? 'Захиалж байна…' : 'Цаг захиалах'}
            </button>
          )}
        </>
      )}
    </Modal>
  )
}

export default ScheduleDentistModal
