'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowTopRightOnSquareIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import type { ScreeningRow } from '@/hooks/useScreenings'
import { SkeletonTable } from '@/components/ui/Skeleton'

type Props = { screenings: ScreeningRow[] | undefined }
type Sort  = 'recent' | 'oldest' | 'level'

const LEVEL_CLS:   Record<string, string> = { green: 'text-triage-green', yellow: 'text-triage-yellow', red: 'text-triage-red' }
const LEVEL_BG:    Record<string, string> = { green: 'bg-triage-green', yellow: 'bg-triage-yellow', red: 'bg-triage-red' }
const LEVEL_LABEL: Record<string, string> = { green: 'Аюулгүй', yellow: 'Анхаар', red: 'Яаралтай' }
const SORT_LABEL:  Record<Sort, string>   = { recent: 'Сүүлийн', oldest: 'Эртний', level: 'Түвшин' }
const LEVEL_RANK:  Record<string, number> = { red: 0, yellow: 1, green: 2 }

const fmt = (iso: string) => {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }),
  }
}

const RecentScreeningsTable = ({ screenings }: Props) => {
  const [sort, setSort]       = useState<Sort>('recent')
  const [sortOpen, setSortOpen] = useState(false)

  if (!screenings) return <SkeletonTable />

  const sorted = [...screenings].slice(0, 5).sort((a, b) => {
    if (sort === 'oldest') return new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
    if (sort === 'level')  return (LEVEL_RANK[a.triageLevel] ?? 9) - (LEVEL_RANK[b.triageLevel] ?? 9)
    return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
  })

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-(--shadow-card) transition-shadow duration-200 hover:shadow-(--shadow-card-lg)">
      <div className="flex items-start justify-between px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold text-text-base">Скрининг бүртгэл</h2>
          <p className="text-[11px] text-text-muted">Сүүлийн бүртгэл</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="btn flex items-center gap-1 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-[11px] font-medium text-text-muted transition-all duration-150 hover:border-primary hover:text-primary"
          >
            {SORT_LABEL[sort]}
            <ChevronDownIcon className={`size-3 transition-transform duration-150 ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-border bg-surface shadow-(--shadow-float)">
              {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
                <button key={s} onClick={() => { setSort(s); setSortOpen(false) }}
                  className={`btn block w-full px-4 py-2 text-left text-[12px] transition-all duration-150 hover:bg-surface-raised ${sort === s ? 'font-semibold text-primary' : 'text-text-base'}`}>
                  {SORT_LABEL[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-t border-border px-5 py-2.5">
        {['Хүүхэд', 'Огноо', 'Цаг', 'Түвшин'].map((h) => (
          <span key={h} className="text-[11px] font-medium text-text-muted">{h}</span>
        ))}
      </div>

      {sorted.length === 0
        ? <p className="px-5 py-8 text-center text-[13px] text-text-muted">Скрининг байхгүй</p>
        : sorted.map((s) => {
            const { date, time } = fmt(s.capturedAt)
            return (
              <Link key={s.id} href={`/dentist/screenings/${s.id}`}
                className="btn grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 border-t border-border-muted px-5 py-3 transition-all duration-150 hover:bg-surface-raised">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className={`size-7 shrink-0 rounded-full ${LEVEL_BG[s.triageLevel] ?? 'bg-border'} flex items-center justify-center`}>
                    <span className="text-[9px] font-bold text-white">{s.childKey.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="truncate text-[12px] font-medium text-text-base">{s.childKey.slice(0, 10)}</span>
                </div>
                <span className="text-[11px] text-text-muted">{date}</span>
                <span className="text-[11px] text-text-muted">{time}</span>
                <span className={`text-[12px] font-semibold ${LEVEL_CLS[s.triageLevel] ?? ''}`}>
                  {LEVEL_LABEL[s.triageLevel] ?? s.triageLevel}
                </span>
              </Link>
            )
          })
      }

      <div className="border-t border-border-muted px-5 py-3">
        <Link href="/dentist" className="btn text-[12px] font-medium text-primary transition-all duration-150 hover:underline">
          Бүгдийг харах →
        </Link>
      </div>
    </div>
  )
}

export default RecentScreeningsTable
