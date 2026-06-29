'use client'

import { useMemo } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import type { AppointmentRow } from '@/hooks/useAppointments'

const WD = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'] // indexed by getDay()
const MONTHS = Array.from({ length: 12 }, (_, i) => `${i + 1} сар`)
const midnight = (d: Date) => { d.setHours(0, 0, 0, 0); return d.getTime() }

type Props = { appts: AppointmentRow[]; selected: number; onSelect: (ms: number) => void }

// Reference's month-tab + day-pill strip. The parent owns the selected day; the strip
// derives the active month/year from it and marks days that have booked calls.
const CallCalendarStrip = ({ appts, selected, onSelect }: Props) => {
  const sel = new Date(selected)
  const y = sel.getFullYear()
  const m = sel.getMonth()
  const todayKey = midnight(new Date())

  const hasCall = useMemo(() => {
    const s = new Set<number>()
    for (const a of appts) {
      if (a.status === 'cancelled') continue
      const d = new Date(a.scheduledAt)
      if (d.getFullYear() === y && d.getMonth() === m) s.add(d.getDate())
    }
    return s
  }, [appts, y, m])

  const pick = (nm: number, dd: number) => {
    const day = Math.min(dd, new Date(y, nm + 1, 0).getDate())
    onSelect(midnight(new Date(y, nm, day)))
  }
  const days = Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1)

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-(--shadow-card)">
      <div className="mb-3 flex items-center gap-1">
        <button onClick={() => pick(m - 1, sel.getDate())} aria-label="Өмнөх сар" className="btn shrink-0 rounded-full p-1 text-text-muted hover:bg-surface-raised hover:text-text-base"><ChevronLeftIcon className="size-4" /></button>
        <div className="flex flex-1 gap-1 overflow-x-auto">
          {MONTHS.map((label, i) => (
            <button key={label} onClick={() => pick(i, sel.getDate())}
              className={`btn shrink-0 rounded-full px-3 py-1 text-[12.5px] transition ${i === m ? 'font-bold text-primary' : 'font-medium text-text-muted hover:text-text-base'}`}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => pick(m + 1, sel.getDate())} aria-label="Дараах сар" className="btn shrink-0 rounded-full p-1 text-text-muted hover:bg-surface-raised hover:text-text-base"><ChevronRightIcon className="size-4" /></button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((dd) => {
          const date = new Date(y, m, dd)
          const isSel = dd === sel.getDate()
          const isToday = midnight(new Date(y, m, dd)) === todayKey
          const has = hasCall.has(dd)
          return (
            <button key={dd} onClick={() => pick(m, dd)}
              className={`btn flex min-w-[46px] shrink-0 flex-col items-center gap-0.5 rounded-full py-2 transition ${
                isSel ? 'bg-primary text-text-on-primary shadow-(--shadow-card)'
                : isToday ? 'bg-surface-raised text-text-base ring-1 ring-primary/40'
                : 'bg-surface-raised text-text-base hover:ring-1 hover:ring-border'
              }`}>
              <span className="text-[10px] font-medium opacity-70">{WD[date.getDay()]}</span>
              <span className="text-[16px] font-bold leading-none tabular-nums">{dd}</span>
              <span className={`mt-0.5 size-1.5 rounded-full ${has ? (isSel ? 'bg-text-on-primary' : 'bg-primary') : 'bg-transparent'}`} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CallCalendarStrip
