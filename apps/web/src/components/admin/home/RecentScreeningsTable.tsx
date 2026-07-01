'use client'

import { useState } from 'react'
import Link from 'next/link'
import { InboxIcon, BarsArrowDownIcon, BarsArrowUpIcon, FireIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import type { ScreeningRow } from '@/hooks/useScreenings'
import { SkeletonTable } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import StatusPill, { type Tone } from '@/components/ui/StatusPill'
import Dropdown, { type DropdownOption } from '@/components/ui/Dropdown'

type Props = { screenings: ScreeningRow[] | undefined; loading?: boolean }
type Sort  = 'recent' | 'oldest' | 'level'

const PAGE_SIZE = 5

const AVA:   Record<string, string> = { green: 'bg-triage-green-bg text-triage-green', yellow: 'bg-triage-yellow-bg text-triage-yellow', red: 'bg-triage-red-bg text-triage-red' }
const TONE:  Record<string, Tone>   = { green: 'safe', yellow: 'check', red: 'danger' }
const LABEL: Record<string, string> = { green: 'Дараагийн хяналт', yellow: 'Эмчилгээ', red: 'Яаралтай' }
const SORT_OPTS: DropdownOption<Sort>[] = [
  { value: 'level',  label: 'Эрэмбэ',  Icon: FireIcon },
  { value: 'recent', label: 'Сүүлийн', Icon: BarsArrowDownIcon },
  { value: 'oldest', label: 'Эртний',  Icon: BarsArrowUpIcon },
]
const RANK:  Record<string, number> = { red: 0, yellow: 1, green: 2 }

const COLS = 'grid grid-cols-[1.5fr_1.1fr_1.2fr_1fr] items-center gap-3'

const conf = (s: ScreeningRow) => (s.findings.length ? Math.round(Math.max(...s.findings.map((f) => f.confidence)) * 100) : null)

const RecentScreeningsTable = ({ screenings, loading }: Props) => {
  const [sort, setSort] = useState<Sort>('level')
  const [page, setPage] = useState(0)
  const [showAll, setShowAll] = useState(false)

  if (loading) return <SkeletonTable />

  const sorted = [...(screenings ?? [])].sort((a, b) => {
    if (sort === 'oldest') return new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
    if (sort === 'level')  return (RANK[a.triageLevel] ?? 9) - (RANK[b.triageLevel] ?? 9)
    return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
  })

  const totalPages   = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage     = Math.min(page, totalPages - 1)
  const pageRows     = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const visibleRows  = showAll ? sorted : pageRows
  const showPaging   = !showAll && totalPages > 1

  return (
    <div className="blob-lg pop-in flex flex-col border border-border bg-surface shadow-(--shadow-card)" style={{ animationDelay: '240ms' }}>
      <div className="flex items-start justify-between px-6 py-4">
        <div>
          <h2 className="text-[16px] font-semibold text-text-base">Хяналтын дараалал</h2>
          <p className="text-[11px] text-text-muted">Яаралтай тусламж, эмчилгээ шаардлагатай эсэхээр дараалал харагдана.</p>
        </div>
        <Dropdown value={sort} options={SORT_OPTS} onChange={setSort} ariaLabel="Эрэмбэлэх" size="sm" align="right" />
      </div>

      <div className={`${COLS} border-t border-border px-6 py-2.5`}>
        {['Хүүхдийн код', 'Төлөв', 'Синк', 'Магадлал'].map((h) => (
          <span key={h} className="text-[10.5px] font-semibold uppercase tracking-wide text-text-muted">{h}</span>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState Icon={InboxIcon} title="Хэрэглэгчийн бүртгэл алга" hint="Шинэ хэрэглэгчээр нэвтрэхэд дараалал энд харагдана." />
      ) : (
        visibleRows.map((s) => {
          const c = conf(s)
          return (
            <Link key={s.id} href={`/dashboard/dentist/screenings/${s.id}`}
              className={`group ${COLS} border-t border-border-muted px-6 py-3.5 transition-all duration-150 hover:bg-surface-raised`}>
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-2xl text-[10px] font-bold transition-transform duration-200 group-hover:scale-110 ${AVA[s.triageLevel] ?? 'bg-surface-raised text-text-muted'}`}>
                  {s.childKey.slice(0, 3).toUpperCase()}
                </div>
                <span className="truncate font-mono text-[12.5px] text-text-base">{s.childKey.slice(0, 16)}</span>
              </div>
              <StatusPill tone={TONE[s.triageLevel] ?? 'neutral'}>{LABEL[s.triageLevel] ?? s.triageLevel}</StatusPill>
              {s.syncedAt
                ? <StatusPill tone="synced">Хадгалагдсан</StatusPill>
                : <StatusPill tone="pending" pulse>Хүлээгдэж буй</StatusPill>}
              <div className="flex items-center gap-2">
                {c === null ? <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-text-muted">0 илрэл</span> : (
                  <>
                    <span className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-raised">
                      <span className="block h-full rounded-full" style={{ width: `${c}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-brand-accent))' }} />
                    </span>
                    <span className="text-[12px] font-medium text-text-muted">{c}%</span>
                  </>
                )}
              </div>
            </Link>
          )
        })
      )}

      <div className="flex items-center justify-between border-t border-border-muted px-6 py-3">
        {sorted.length > PAGE_SIZE ? (
          <button onClick={() => setShowAll(v => !v)} className="btn text-[12px] font-medium text-primary transition-all duration-150 hover:underline">
            {showAll ? 'Хумих' : `Бүгдийг харах (${sorted.length})`}
          </button>
        ) : <span />}
        {showPaging && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[12px] font-medium text-text-base transition-colors hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeftIcon className="size-3.5" /> Өмнөх
            </button>
            <span className="text-[12px] text-text-muted">
              {safePage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={safePage === totalPages - 1}
              className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[12px] font-medium text-text-base transition-colors hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
            >
              Дараах <ChevronRightIcon className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentScreeningsTable
