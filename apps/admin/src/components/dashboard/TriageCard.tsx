'use client'

import Link from 'next/link'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import type { DashStats } from '@/hooks/useStats'
import { SkeletonCard } from '@/components/ui/Skeleton'

type Props = { stats: DashStats | undefined }

const LEVELS = [
  {
    key: 'green' as const,
    label: 'Аюулгүй',
    sub: 'Аюулын шинж илрээгүй',
    iconBg: 'bg-triage-green',
    badge: 'bg-triage-green-bg text-triage-green',
    initial: 'А',
  },
  {
    key: 'yellow' as const,
    label: 'Анхааруулга',
    sub: 'Шалгуулахыг зөвлөнө',
    iconBg: 'bg-triage-yellow',
    badge: 'bg-triage-yellow-bg text-triage-yellow',
    initial: 'Ан',
  },
  {
    key: 'red' as const,
    label: 'Яаралтай',
    sub: 'Эмчид яаралтай хандах',
    iconBg: 'bg-triage-red',
    badge: 'bg-triage-red-bg text-triage-red',
    initial: 'Яа',
  },
]

const TriageCard = ({ stats }: Props) => {
  if (!stats) return <SkeletonCard rows={3} />

  const total = stats.triage.green + stats.triage.yellow + stats.triage.red

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-(--shadow-card) transition-shadow duration-200 hover:shadow-(--shadow-card-lg)">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-text-base">Тархалт</h2>
        <Link
          href="/dentist"
          className="btn rounded-lg p-1 text-text-muted transition-all duration-150 hover:text-text-base"
          title="Шалгалт харах"
        >
          <ArrowTopRightOnSquareIcon className="size-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {LEVELS.map((lvl) => {
          const count = stats.triage[lvl.key]
          const pct   = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={lvl.key} className="flex items-center gap-3">
              <div className={`size-10 shrink-0 rounded-full ${lvl.iconBg} flex items-center justify-center shadow-sm`}>
                <span className="text-[11px] font-bold text-white">{lvl.initial}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-text-base">{lvl.label}</p>
                <p className="text-[11px] text-text-muted">{count} хүүхэд</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${lvl.badge}`}>{pct}%</span>
                <span className="text-[10px] text-text-muted">Улирлаар</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TriageCard
