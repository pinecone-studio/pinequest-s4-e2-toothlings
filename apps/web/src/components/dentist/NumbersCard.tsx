'use client'

import type { ComponentType, SVGProps } from 'react'
import { PhoneIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/solid'
import type { AppointmentRow } from '@/hooks/useAppointments'

type Props = { appts: AppointmentRow[] }

const Tile = ({ Icon, value, label }: { Icon: ComponentType<SVGProps<SVGSVGElement>>; value: number; label: string }) => (
  <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-surface-raised px-4">
    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary"><Icon className="size-5" /></div>
    <div>
      <p className="text-[22px] font-bold leading-none text-text-base">{value}</p>
      <p className="mt-1 text-[12px] text-text-muted">{label}</p>
    </div>
  </div>
)

// Top-bar numbers: called / scheduled / upcoming. Tiles grow to fill the height.
const NumbersCard = ({ appts }: Props) => {
  const now = Date.now()
  const active = appts.filter((a) => a.status !== 'cancelled')
  const called = active.filter((a) => a.scheduledAt < now).length
  const upcoming = active.filter((a) => a.scheduledAt >= now).length

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-surface p-5 shadow-(--shadow-card)">
      <h3 className="mb-3 text-[15px] font-bold text-text-base">Дуудлагын тойм</h3>
      <div className="flex flex-1 flex-col gap-3">
        <Tile Icon={PhoneIcon} value={called} label="Дуудсан" />
        <Tile Icon={CalendarDaysIcon} value={active.length} label="Товлосон" />
        <Tile Icon={ClockIcon} value={upcoming} label="Удахгүй болох" />
      </div>
    </div>
  )
}

export default NumbersCard
