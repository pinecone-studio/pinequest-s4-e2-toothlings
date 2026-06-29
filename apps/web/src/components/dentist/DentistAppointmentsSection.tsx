'use client'

import { useState, useEffect, useRef } from 'react'
import { VideoCameraIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/solid'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { useMyAppointments, type AppointmentRow } from '@/hooks/useAppointments'
import { useToast } from '@/components/ui/Toast'
import { useCall } from '@/context/IncomingCallContext'
import StudentSummaryModal from './StudentSummaryModal'
import IconButton from '@/components/ui/IconButton'
import EmptyState from '@/components/ui/EmptyState'

const time = (ms: number) => new Date(ms).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
const day = (ms: number) => new Date(ms).getDate()
const mon = (ms: number) => `${new Date(ms).getMonth() + 1}-р сар`
const age = (y: number | null) => (y ? `${new Date().getFullYear() - y} нас` : null)

// Booked calls as a schedule list; the expand button opens each student's summary.
const DentistAppointmentsSection = () => {
  const { data: appts = [] } = useMyAppointments()
  const toast = useToast()
  const { startCall } = useCall()
  const [summary, setSummary] = useState<AppointmentRow | null>(null)
  const list = [...appts].filter((a) => a.status !== 'cancelled').sort((a, b) => a.scheduledAt - b.scheduledAt)

  // Notify the dentist when a student books a new call (feed polls every 30s).
  const seen = useRef<Set<string> | null>(null)
  useEffect(() => {
    const ids = new Set(appts.map((a) => a.id))
    if (seen.current === null) { seen.current = ids; return } // skip first load
    for (const a of appts) {
      if (!seen.current.has(a.id)) toast.info(`Шинэ видео дуудлага товлогдлоо: ${a.childName ?? 'Сурагч'}`)
    }
    seen.current = ids
  }, [appts, toast])

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-(--shadow-card)">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-text-base">Товлосон видео дуудлага</h2>
        <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-[12px] font-semibold text-primary">{list.length}</span>
      </div>

      {list.length === 0 ? (
        <EmptyState Icon={CalendarDaysIcon} title="Товлосон дуудлага алга" hint="Сурагч цаг товлоход энд харагдана." compact />
      ) : (
        <div className="flex flex-col gap-2.5">
          {list.map((a, i) => {
            const name = a.childName ?? a.childKey.slice(0, 8)
            const red = a.level === 'red'
            const info = [a.className, age(a.birthYear)].filter(Boolean).join(' · ')
            return (
              <div key={a.id} className={`flex items-center gap-3 rounded-2xl border p-3 transition ${i === 0 ? 'border-primary/40 bg-primary-subtle' : 'border-border bg-surface-raised'}`}>
                <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-surface">
                  <span className="text-[16px] font-bold leading-none text-text-base">{day(a.scheduledAt)}</span>
                  <span className="text-[9px] text-text-muted">{mon(a.scheduledAt)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[14px] font-semibold text-text-base">{name}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${red ? 'bg-triage-red-bg text-triage-red' : 'bg-triage-yellow-bg text-triage-yellow'}`}>
                      {red ? 'Яаралтай' : 'Эмчилгээ'}
                    </span>
                  </div>
                  <p className="truncate text-[12px] text-text-muted">{time(a.scheduledAt)}{info ? ` · ${info}` : ''}</p>
                  {a.note && <p className="mt-0.5 truncate text-[11px] text-text-secondary">📝 {a.note}</p>}
                </div>
                <IconButton Icon={ArrowsPointingOutIcon} tone="plain" size="sm" label="Дэлгэрэнгүй" onClick={() => setSummary(a)} />
                <button onClick={() => startCall(a.createdById, a.childName ?? 'Сурагч')} className="btn flex shrink-0 items-center gap-1 rounded-full bg-triage-red px-3.5 py-2 text-[12px] font-semibold text-white transition hover:opacity-90">
                  <VideoCameraIcon className="size-3.5" /> Дуудах
                </button>
              </div>
            )
          })}
        </div>
      )}

      {summary && <StudentSummaryModal appt={summary} onClose={() => setSummary(null)} />}
    </div>
  )
}

export default DentistAppointmentsSection
