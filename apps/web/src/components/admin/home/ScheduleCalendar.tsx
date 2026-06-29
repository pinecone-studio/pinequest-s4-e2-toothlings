'use client'

import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { useSchedule, type ScheduleEvent } from '@/hooks/useSchedule'
import PlayCard from '@/components/ui/PlayCard'
import { SkeletonCard } from '@/components/ui/Skeleton'

const WEEKDAYS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня']
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

// Month calendar marking DB-scheduled class visits + follow-up appointments.
const ScheduleCalendar = () => {
  const { data, isLoading } = useSchedule()
  const today = new Date()
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [sel, setSel] = useState<string>(dayKey(today))

  if (isLoading) return <SkeletonCard rows={4} />

  const byDay = new Map<string, ScheduleEvent[]>()
  for (const e of data ?? []) {
    const k = dayKey(new Date(e.date))
    byDay.set(k, [...(byDay.get(k) ?? []), e])
  }

  const first = new Date(view.y, view.m, 1)
  const lead = (first.getDay() + 6) % 7 // week starts Monday
  const days = new Date(view.y, view.m + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => new Date(view.y, view.m, i + 1)),
  ]
  while (cells.length % 7) cells.push(null)

  const shift = (delta: number) => {
    const m = view.m + delta
    setView({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 })
  }

  const selEvents = byDay.get(sel) ?? []

  return (
    <PlayCard tone="surface" delay={2}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-text-base">Календар</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => shift(-1)} aria-label="Өмнөх сар" className="btn rounded-full p-1 text-text-muted hover:bg-surface-raised hover:text-text-base"><ChevronLeftIcon className="size-4" /></button>
          <span className="min-w-23 text-center text-[12px] font-medium text-text-base">{first.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long' })}</span>
          <button onClick={() => shift(1)} aria-label="Дараагийн сар" className="btn rounded-full p-1 text-text-muted hover:bg-surface-raised hover:text-text-base"><ChevronRightIcon className="size-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => <span key={w} className="pb-1 text-[10px] font-medium text-text-muted">{w}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />
          const k = dayKey(d)
          const has = byDay.has(k)
          const isToday = k === dayKey(today)
          const isSel = k === sel
          return (
            <button key={i} onClick={() => setSel(k)}
              className={`btn relative flex aspect-square items-center justify-center rounded-full text-[12px] tabular-nums transition-colors ${
                isSel ? 'bg-primary font-bold text-text-on-primary' : isToday ? 'bg-primary-subtle font-semibold text-primary' : 'text-text-base hover:bg-surface-raised'
              }`}>
              {d.getDate()}
              {has && <span className={`absolute bottom-1 size-1 rounded-full ${isSel ? 'bg-text-on-primary' : 'bg-primary'}`} />}
            </button>
          )
        })}
      </div>

      <div className="mt-3 border-t border-border-muted pt-3">
        {selEvents.length === 0 ? (
          <p className="text-[11px] text-text-muted">Энэ өдөр төлөвлөгөө алга.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {selEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-2">
                <span className={`mt-1 size-2 shrink-0 rounded-full ${e.kind === 'visit' ? 'bg-primary' : 'bg-triage-yellow'}`} />
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium text-text-base">{e.title}</p>
                  <p className="text-[10px] text-text-muted">
                    {new Date(e.date).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                    {e.kind === 'visit' ? 'Дараагийн хяналт' : 'Хяналт'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PlayCard>
  )
}

export default ScheduleCalendar
