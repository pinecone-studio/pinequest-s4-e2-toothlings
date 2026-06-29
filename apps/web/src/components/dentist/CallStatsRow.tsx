'use client'

import type { ComponentType, SVGProps } from 'react'
import { CalendarDaysIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/solid'
import type { AppointmentRow } from '@/hooks/useAppointments'

const DAY = 86_400_000
const midnight = (ms: number) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime() }

// Daily counts for a 7-day window described by day-offsets from today (honest data,
// not decoration) — drives each card's trend line.
const seriesFor = (appts: AppointmentRow[], offsets: number[]) => {
  const counts: Record<number, number> = {}
  for (const a of appts) { const k = midnight(a.scheduledAt); counts[k] = (counts[k] ?? 0) + 1 }
  const base = midnight(Date.now())
  return offsets.map((o) => counts[base + o * DAY] ?? 0)
}

// Tiny inline trend line — normalized to the series max, flat when empty.
const Spark = ({ data, tone }: { data: number[]; tone: string }) => {
  const max = Math.max(1, ...data)
  const step = data.length > 1 ? 60 / (data.length - 1) : 0
  const pts = data.map((v, i) => `${i * step},${20 - (v / max) * 18}`).join(' ')
  return (
    <svg viewBox="0 0 60 22" className="h-6 w-16 overflow-visible" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke={`var(--color-${tone})`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type StatProps = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  value: number
  label: string
  today: number
  data: number[]
  tone: string
}

const Stat = ({ Icon, value, label, today, data, tone }: StatProps) => (
  <div className="grow flex flex-1 flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4 shadow-(--shadow-card)">
    <div className="flex items-center justify-between">
      <span className="flex size-9 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, var(--color-${tone}) 14%, transparent)`, color: `var(--color-${tone})` }}>
        <Icon className="size-[18px]" />
      </span>
      <Spark data={data} tone={tone} />
    </div>
    <div>
      <p className="stat-rise text-[26px] font-bold leading-none text-text-base tabular-nums">{value}</p>
      <p className="mt-1.5 text-[12px] text-text-muted">{label}{today > 0 && <span className="ml-1 font-semibold text-text-secondary">· өнөөдөр {today}</span>}</p>
    </div>
  </div>
)

// Reference's Active / Complete / Totals row → Booked / Called / Upcoming for calls.
const CallStatsRow = ({ appts }: { appts: AppointmentRow[] }) => {
  const now = Date.now()
  const active = appts.filter((a) => a.status !== 'cancelled')
  const called = active.filter((a) => a.status === 'completed') // real status, set on note save
  const upcoming = active.filter((a) => a.status !== 'completed' && a.scheduledAt >= now)
  const todayCount = (rows: AppointmentRow[]) => rows.filter((a) => midnight(a.scheduledAt) === midnight(now)).length

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Stat Icon={CalendarDaysIcon} value={active.length} label="Товлосон" today={todayCount(active)} tone="primary"
        data={seriesFor(active, [-3, -2, -1, 0, 1, 2, 3])} />
      <Stat Icon={PhoneIcon} value={called.length} label="Дуудсан" today={todayCount(called)} tone="triage-green"
        data={seriesFor(called, [-6, -5, -4, -3, -2, -1, 0])} />
      <Stat Icon={ClockIcon} value={upcoming.length} label="Удахгүй болох" today={todayCount(upcoming)} tone="triage-yellow"
        data={seriesFor(upcoming, [0, 1, 2, 3, 4, 5, 6])} />
    </div>
  )
}

export default CallStatsRow
