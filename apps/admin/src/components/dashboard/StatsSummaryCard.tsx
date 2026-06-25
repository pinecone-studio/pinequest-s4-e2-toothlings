'use client'

import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowTopRightOnSquareIcon, ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon, ArrowPathIcon, ArrowUpTrayIcon, EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'
import { ArrowTrendingUpIcon } from '@heroicons/react/20/solid'
import type { DashStats } from '@/hooks/useStats'
import { SkeletonCard } from '@/components/ui/Skeleton'

type Props = { stats: DashStats | undefined }

const StatsSummaryCard = ({ stats }: Props) => {
  const qc = useQueryClient()
  if (!stats) return <SkeletonCard rows={2} />

  const screened     = stats.totalScreened
  const total        = stats.coverage.total
  const coveragePct  = total > 0 ? Math.round((screened / total) * 100) : 0
  const pending      = stats.pendingReview
  const resolved     = stats.resolvedFollowUps

  const ACTIONS = [
    { Icon: ClipboardDocumentCheckIcon, label: 'Шалгалт', href: '/dentist',   isLink: true },
    { Icon: ClipboardDocumentListIcon,  label: 'Дагалт',  href: '/follow-up', isLink: true },
    { Icon: ArrowPathIcon,              label: 'Шинэчлэх', href: null,        isLink: false },
    { Icon: ArrowUpTrayIcon,            label: 'Экспорт',  href: null,        isLink: false },
  ]

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-(--shadow-card) transition-shadow duration-200 hover:shadow-(--shadow-card-lg)">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-text-base">Нийт самбар</h2>
        <Link href="/admin" className="btn rounded-lg p-1 text-text-muted transition-all duration-150 hover:text-text-base">
          <ArrowTopRightOnSquareIcon className="size-4" />
        </Link>
      </div>
      <p className="text-[11px] text-text-muted">Нийт скрининг</p>
      <p className="mb-5 mt-0.5 text-[32px] font-bold leading-none tracking-tight text-text-base">
        {screened.toLocaleString()}
      </p>

      <div className="mb-5 flex gap-2.5">
        {ACTIONS.map(({ Icon, label, href, isLink }) =>
          isLink ? (
            <Link key={label} href={href!} title={label}
              className="btn flex flex-1 items-center justify-center rounded-xl bg-surface-raised py-3 text-text-muted transition-all duration-150 hover:bg-primary-subtle hover:text-primary">
              <Icon className="size-5" />
            </Link>
          ) : (
            <button key={label} title={label}
              onClick={label === 'Шинэчлэх' ? () => qc.invalidateQueries() : undefined}
              className="btn flex flex-1 items-center justify-center rounded-xl bg-surface-raised py-3 text-text-muted transition-all duration-150 hover:bg-primary-subtle hover:text-primary">
              <Icon className="size-5" />
            </button>
          )
        )}
      </div>

      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[12px] font-medium text-text-base">Хамрагдалт</p>
        <button className="btn rounded-full p-1 text-text-muted transition-all duration-150 hover:text-text-base">
          <EllipsisVerticalIcon className="size-4" />
        </button>
      </div>
      <div className="mb-1.5 h-2.5 overflow-hidden rounded-full bg-border-muted">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${coveragePct}%`, backgroundColor: 'var(--color-accent)' }} />
      </div>
      <p className="mb-4 text-[11px] text-text-muted">{screened}/{total} хүүхэд · {coveragePct}%</p>

      <div className="flex items-center justify-between rounded-xl bg-surface-raised px-4 py-3">
        <div>
          <p className="text-[11px] text-text-muted">Хянах хүлээгдэж</p>
          <p className="text-[18px] font-bold text-text-base">{pending}</p>
        </div>
        {resolved > 0 && (
          <div className="btn flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-fg)' }}>
            <ArrowTrendingUpIcon className="size-3" />
            {resolved} дууссан
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsSummaryCard
