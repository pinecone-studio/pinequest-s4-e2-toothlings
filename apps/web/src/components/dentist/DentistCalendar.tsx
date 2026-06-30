'use client'

import { useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import type { AppointmentRow } from '@/hooks/useAppointments'

const WD = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня']
const hhmm = (ms: number) => new Date(ms).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })

// Month calendar of the dentist's booked calls: today is a gold circle, days with
// calls get a dot, and tapping a day lists that day's students below.
const DentistCalendar = ({ appts }: { appts: AppointmentRow[] }) => {
  const today = new Date()
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [selected, setSelected] = useState<number | null>(today.getDate())

  const byDay = useMemo(() => {
    const map: Record<number, AppointmentRow[]> = {}
    for (const a of appts) {
      if (a.status === 'cancelled') continue
      const d = new Date(a.scheduledAt)
      if (d.getFullYear() === view.y && d.getMonth() === view.m) (map[d.getDate()] ??= []).push(a)
    }
    return map
  }, [appts, view])

  const startWd = (new Date(view.y, view.m, 1).getDay() + 6) % 7 // Monday-first
  const total = new Date(view.y, view.m + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(startWd).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  const monthLabel = `${view.y} оны ${view.m + 1} сар`
  const isToday = (d: number) => d === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear()
  const step = (dir: number) => {
    const nm = view.m + dir
    setView({ y: view.y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 })
    setSelected(null)
  }
  const sel = selected ? byDay[selected] ?? [] : []

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-surface p-5 shadow-(--shadow-card)">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-text-base">Календар</h3>
        <div className="flex items-center gap-1.5">
          <button onClick={() => step(-1)} aria-label="Өмнөх" className="btn rounded-full p-1 text-text-muted transition hover:bg-surface-raised hover:text-text-base"><ChevronLeftIcon className="size-4" /></button>
          <span className="min-w-[100px] text-center text-[12.5px] font-semibold text-text-base">{monthLabel}</span>
          <button onClick={() => step(1)} aria-label="Дараах" className="btn rounded-full p-1 text-text-muted transition hover:bg-surface-raised hover:text-text-base"><ChevronRightIcon className="size-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 justify-items-center gap-y-1">
        {WD.map((w) => <span key={w} className="pb-1 text-[10.5px] font-medium text-text-muted">{w}</span>)}
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />
          const has = !!byDay[d]?.length
          const tdy = isToday(d)
          return (
            <button key={d} onClick={() => setSelected(d)} className="flex flex-col items-center gap-1">
              <span className={`flex size-8 items-center justify-center rounded-full text-[12.5px] transition ${
                tdy ? 'bg-primary font-bold text-text-on-primary'
                : d === selected ? 'bg-primary-subtle font-semibold text-text-base'
                : 'text-text-base hover:bg-surface-raised'
              }`}>{d}</span>
              <span className={`size-1.5 rounded-full ${has ? 'bg-primary' : 'bg-transparent'}`} />
            </button>
          )
        })}
      </div>

      <div className="mt-auto border-t border-border pt-3">
        {sel.length === 0 ? (
          <p className="text-[12px] text-text-muted">Энэ өдөр товлосон дуудлага алга.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {sel.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate font-medium text-text-base">{a.childName ?? a.childKey.slice(0, 6)}</span>
                <span className="shrink-0 text-text-muted">{hhmm(a.scheduledAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DentistCalendar
