'use client'

import Link from 'next/link'
import { CalendarDaysIcon, UsersIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import type { SchoolClassRow } from '@pinequest/types'

type Props = { row: SchoolClassRow; onSchedule: (row: SchoolClassRow) => void }

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('mn-MN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

const ClassListRow = ({ row, onSchedule }: Props) => {
  const pct = row.enrolled > 0 ? Math.round((row.screened / row.enrolled) * 100) : 0

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-(--shadow-card) transition-shadow duration-200 hover:shadow-(--shadow-card-lg)">
      <Link href={`/admin/classes/${row.id}`} className="btn flex min-w-0 flex-1 flex-col gap-1 transition-all duration-150">
        <span className="text-[14px] font-semibold text-text-base">
          {row.name} <span className="font-normal text-text-muted">· {row.seasonId}</span>
        </span>
        <span className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
          <span className="inline-flex items-center gap-1">
            <UsersIcon className="size-3.5" /> {row.screened}/{row.enrolled} хамрагдсан ({pct}%)
          </span>
          {row.scheduledAt && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2 py-0.5 font-medium text-primary">
              <CalendarDaysIcon className="size-3.5" /> {fmtDate(row.scheduledAt)}
            </span>
          )}
        </span>
      </Link>

      <button
        onClick={() => onSchedule(row)}
        className="btn flex shrink-0 items-center gap-1 rounded-xl border border-border bg-surface-raised px-3 py-2 text-[12px] font-medium text-text-muted transition-all duration-150 hover:border-primary hover:text-primary"
      >
        Дараа улирал <ArrowRightIcon className="size-3.5" />
      </button>
    </li>
  )
}

export default ClassListRow
