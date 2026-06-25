'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDownIcon, InboxIcon } from '@heroicons/react/24/outline'
import type { ScreeningRow } from '@/hooks/useScreenings'
import { SkeletonTable } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import StatusPill, { type Tone } from '@/components/ui/StatusPill'

type Props = { screenings: ScreeningRow[] | undefined }
type Sort  = 'recent' | 'oldest' | 'level'

const AVA:   Record<string, string> = { green: 'bg-triage-green-bg text-triage-green', yellow: 'bg-triage-yellow-bg text-triage-yellow', red: 'bg-triage-red-bg text-triage-red' }
const TONE:  Record<string, Tone>   = { green: 'safe', yellow: 'check', red: 'danger' }
const LABEL: Record<string, string> = { green: 'Аюулгүй', yellow: 'Анхаар', red: 'Яаралтай' }
const SORT:  Record<Sort, string>   = { recent: 'Сүүлийн', oldest: 'Эртний', level: 'Түвшин' }
const RANK:  Record<string, number> = { red: 0, yellow: 1, green: 2 }

const COLS = 'grid grid-cols-[1.5fr_1.1fr_1.6fr_1.2fr_1fr] items-center gap-3'

const conf = (s: ScreeningRow) => (s.findings.length ? Math.round(Math.max(...s.findings.map((f) => f.confidence)) * 100) : null)

const RecentScreeningsTable = ({ screenings }: Props) => {
  const [sort, setSort]         = useState<Sort>('level')
  const [sortOpen, setSortOpen] = useState(false)

  if (!screenings) return <SkeletonTable />

  const sorted = [...screenings].sort((a, b) => {
    if (sort === 'oldest') return new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
    if (sort === 'level')  return (RANK[a.triageLevel] ?? 9) - (RANK[b.triageLevel] ?? 9)
    return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
  })

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-(--shadow-card)">
      <div className="flex items-start justify-between px-6 py-4">
        <div>
          <h2 className="text-[16px] font-semibold text-text-base">Хяналтын дараалал</h2>
          <p className="text-[11px] text-text-muted">Эрсдэлээр эрэмбэлсэн · хамгийн яаралтай нь эхэнд</p>
        </div>
        <div className="relative">
          <button onClick={() => setSortOpen((v) => !v)} aria-haspopup="menu" aria-expanded={sortOpen} aria-label="Эрэмбэлэх"
            className="btn flex items-center gap-1 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-[11px] font-medium text-text-muted transition-all duration-150 hover:border-primary hover:text-primary">
            {SORT[sort]}
            <ChevronDownIcon className={`size-3 transition-transform duration-150 ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-border bg-surface shadow-(--shadow-float)">
              {(Object.keys(SORT) as Sort[]).map((s) => (
                <button key={s} onClick={() => { setSort(s); setSortOpen(false) }}
                  className={`btn block w-full px-4 py-2 text-left text-[12px] transition-all duration-150 hover:bg-surface-raised ${sort === s ? 'font-semibold text-primary' : 'text-text-base'}`}>
                  {SORT[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`${COLS} border-t border-border px-6 py-2.5`}>
        {['Хүүхдийн код', 'Төлөв', 'Оношилгооны шинж', 'Синк', 'Магадлал'].map((h) => (
          <span key={h} className="text-[10.5px] font-semibold uppercase tracking-wide text-text-muted">{h}</span>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState Icon={InboxIcon} title="Скрининг бүртгэл алга" hint="Шинэ скрининг ирэхэд энд эрэмбэлэгдэж харагдана." />
      ) : (
        sorted.map((s) => {
          const c = conf(s)
          return (
            <Link key={s.id} href={`/dashboard/dentist/screenings/${s.id}`}
              className={`btn ${COLS} border-t border-border-muted px-6 py-3.5 transition-all duration-150 hover:bg-surface-raised`}>
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ${AVA[s.triageLevel] ?? 'bg-surface-raised text-text-muted'}`}>
                  {s.childKey.slice(0, 3).toUpperCase()}
                </div>
                <span className="truncate font-mono text-[12.5px] text-text-base">{s.childKey.slice(0, 16)}</span>
              </div>
              <StatusPill tone={TONE[s.triageLevel] ?? 'neutral'}>{LABEL[s.triageLevel] ?? s.triageLevel}</StatusPill>
              <span className="truncate text-[12px] text-text-muted">{s.triageReason ?? '—'}</span>
              {s.syncedAt
                ? <StatusPill tone="synced">Синк хийгдсэн</StatusPill>
                : <StatusPill tone="pending" pulse>Хүлээгдэж буй</StatusPill>}
              <div className="flex items-center gap-2">
                {c === null ? <span className="text-[12px] text-text-muted">—</span> : (
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

      <div className="border-t border-border-muted px-6 py-3">
        <Link href="/dashboard/dentist" className="btn text-[12px] font-medium text-primary transition-all duration-150 hover:underline">
          Бүгдийг харах →
        </Link>
      </div>
    </div>
  )
}

export default RecentScreeningsTable
