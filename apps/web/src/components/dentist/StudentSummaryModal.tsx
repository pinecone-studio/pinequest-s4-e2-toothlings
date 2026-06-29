'use client'

import { useState } from 'react'
import { VideoCameraIcon } from '@heroicons/react/24/solid'
import Modal from '@/components/ui/Modal'
import { useUpdateAppointmentNote, type AppointmentRow } from '@/hooks/useAppointments'
import { useCall } from '@/context/IncomingCallContext'

const fmt = (ms: number) => new Date(ms).toLocaleString('mn-MN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
const age = (y: number | null) => (y ? `${new Date().getFullYear() - y} нас` : null)

// Student summary for a booked call + the dentist's post-call advice (next step).
const StudentSummaryModal = ({ appt, onClose }: { appt: AppointmentRow; onClose: () => void }) => {
  const update = useUpdateAppointmentNote()
  const { startCall } = useCall()
  const [note, setNote] = useState(appt.note ?? '')
  const name = appt.childName ?? appt.childKey.slice(0, 8)
  const red = appt.level === 'red'
  const info = [appt.className, age(appt.birthYear)].filter(Boolean).join(' · ')

  const save = () => update.mutate({ id: appt.id, note: note.trim() }, { onSuccess: onClose })

  return (
    <Modal
      open onClose={onClose} title="Сурагчийн дэлгэрэнгүй" size="md"
      footer={
        <>
          <button onClick={() => { onClose(); void startCall(appt.createdById, appt.childName ?? 'Сурагч') }} className="btn flex items-center gap-1 rounded-full bg-triage-red px-4 py-2 text-[13px] font-semibold text-white"><VideoCameraIcon className="size-4" /> Видео дуудлага</button>
          <span className="flex-1" />
          <button onClick={save} disabled={update.isPending} className="btn rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-on-primary hover:bg-primary-hover disabled:opacity-60">
            {update.isPending ? 'Хадгалж байна…' : 'Зөвлөмж хадгалах'}
          </button>
        </>
      }
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-4">
        <span className={`flex size-14 items-center justify-center rounded-2xl bg-surface text-[20px] font-bold ${red ? 'text-triage-red' : 'text-triage-yellow'}`}>{name.charAt(0)}</span>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold text-text-base">{name}</p>
          {info && <p className="text-[12px] text-text-muted">{info}</p>}
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${red ? 'bg-triage-red-bg text-triage-red' : 'bg-triage-yellow-bg text-triage-yellow'}`}>
            {red ? 'Яаралтай эмчилгээ шаардлагатай' : 'Эмчилгээ шаардлагатай'}
          </span>
        </div>
      </div>
      <p className="mt-3 text-[12px] text-text-muted">Товлосон цаг: {fmt(appt.scheduledAt)}</p>

      <p className="mb-1 mt-4 text-[13px] font-semibold text-text-base">Эмчийн зөвлөмж (дараагийн алхам)</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="Жишээ: 36-р шүдийг 2 долоо хоногт эмчлүүлэх, фтор түрхэх…"
        className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </Modal>
  )
}

export default StudentSummaryModal
