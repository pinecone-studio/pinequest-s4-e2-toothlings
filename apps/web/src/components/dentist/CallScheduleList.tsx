'use client'

import { VideoCameraIcon, CalendarDaysIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import type { AppointmentRow } from '@/hooks/useAppointments'
import EmptyState from '@/components/ui/EmptyState'

const hhmm = (ms: number) => new Date(ms).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
const age = (y: number | null) => (y ? `${new Date().getFullYear() - y} нас` : null)

type Props = {
  title: string
  appts: AppointmentRow[]
  selectedId: string | null
  nextId: string | null
  onSelect: (a: AppointmentRow) => void
  onJoin: (a: AppointmentRow) => void
}

// The selected day's booked calls — each row opens its clinical summary on the right
// and carries a Join button. The nearest upcoming call is flagged "Удахгүй".
const CallScheduleList = ({ title, appts, selectedId, nextId, onSelect, onJoin }: Props) => (
  <div className="rounded-2xl border border-border bg-surface p-4 shadow-(--shadow-card)">
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-[14px] font-bold text-text-base">{title}</h3>
      <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-[12px] font-semibold text-primary">{appts.length}</span>
    </div>

    {appts.length === 0 ? (
      <EmptyState Icon={CalendarDaysIcon} title="Энэ өдөр дуудлага алга" hint="Сурагч цаг товлоход энд харагдана." compact />
    ) : (
      <div className="flex flex-col gap-2">
        {appts.map((a) => {
          const name = a.childName ?? a.childKey.slice(0, 8)
          const red = a.level === 'red'
          const isSel = a.id === selectedId
          const done = a.status === 'completed'
          const info = [hhmm(a.scheduledAt), a.className, age(a.birthYear)].filter(Boolean).join(' · ')
          return (
            <div key={a.id} role="button" tabIndex={0} onClick={() => onSelect(a)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(a) } }}
              className={`group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition ${isSel ? 'border-primary/50 bg-primary-subtle' : 'border-border bg-surface-raised hover:bg-surface'}`}>
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-[16px] font-bold ${red ? 'bg-triage-red-bg text-triage-red' : 'bg-triage-yellow-bg text-triage-yellow'}`}>{name.charAt(0)}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13.5px] font-semibold text-text-base">{name}</p>
                  {a.id === nextId && <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-primary">Удахгүй</span>}
                </div>
                <p className="truncate text-[11.5px] text-text-muted">{info}</p>
              </div>
              {done ? (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-triage-green-bg px-2 py-0.5 text-[10px] font-semibold text-triage-green"><CheckCircleIcon className="size-3" /> Дууссан</span>
              ) : (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${red ? 'bg-triage-red-bg text-triage-red' : 'bg-triage-yellow-bg text-triage-yellow'}`}>{red ? 'Яаралтай' : 'Эмчилгээ'}</span>
              )}
              <button onClick={(e) => { e.stopPropagation(); onJoin(a) }} aria-label={`${name}-тэй дуудлага хийх`}
                className="btn flex shrink-0 items-center gap-1 rounded-full bg-triage-red px-3 py-1.5 text-[11.5px] font-semibold text-white transition hover:opacity-90">
                <VideoCameraIcon className="size-3.5" /> Нэгдэх
              </button>
            </div>
          )
        })}
      </div>
    )}
  </div>
)

export default CallScheduleList
