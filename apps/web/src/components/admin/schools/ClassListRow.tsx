'use client'

import Link from 'next/link'
import { CalendarDaysIcon, UsersIcon } from '@heroicons/react/24/solid'
import type { SchoolClassRow } from '@pinequest/types'
import Button from '@/components/ui/Button'
import { formatSeason } from '@/lib/season'

type Props = { row: SchoolClassRow; onSchedule: (row: SchoolClassRow) => void }

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('mn-MN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

const ClassListRow = ({ row, onSchedule }: Props) => {
  const pct = row.enrolled > 0 ? Math.round((row.screened / row.enrolled) * 100) : 0

  return (
    <li className="grow flex items-center gap-3 blob border border-border bg-surface px-4 py-3 shadow-(--shadow-card) hover:shadow-(--shadow-card-lg)">
      <Link href={`/dashboard/classes/${row.id}`} className="btn flex min-w-0 flex-1 flex-col gap-1 transition-all duration-150">
        <span className="text-[14px] font-semibold text-text-base">
          {row.name} <span className="font-normal text-text-muted">· {formatSeason(row.seasonId)}</span>
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

      <Button variant="secondary" size="sm" onClick={() => onSchedule(row)} className="shrink-0">
        Дараа улирал
      </Button>
    </li>
  )
}

export default ClassListRow
