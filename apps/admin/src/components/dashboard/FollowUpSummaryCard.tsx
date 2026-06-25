'use client'

import Link from 'next/link'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import type { FollowUpRow } from '@/hooks/useFollowUps'
import { SkeletonCard } from '@/components/ui/Skeleton'

type Props = { followUps: FollowUpRow[] | undefined }

const STATUS_COLOR: Record<string, string> = {
  flagged:             '#B83838',
  contacted:           '#8A6500',
  referred:            '#48A9B2',
  treatment_completed: '#2A7D4F',
  verified_resolved:   '#2A7D4F',
}

const FollowUpSummaryCard = ({ followUps }: Props) => {
  if (!followUps) return <SkeletonCard rows={1} />

  const flagged  = followUps.filter((f) => f.status === 'flagged')
  const resolved = followUps.filter(
    (f) => f.status === 'treatment_completed' || f.status === 'verified_resolved',
  )
  const resolvePct = followUps.length > 0 ? Math.round((resolved.length / followUps.length) * 100) : 0

  const preview = followUps.slice(0, 4)
  const extra   = Math.max(followUps.length - 4, 0)

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-(--shadow-card) transition-shadow duration-200 hover:shadow-(--shadow-card-lg)">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-text-base">Дагалт</h2>
        <Link
          href="/follow-up"
          className="btn rounded-lg p-1 text-text-muted transition-all duration-150 hover:text-text-base"
          title="Дагалт харах"
        >
          <ArrowTopRightOnSquareIcon className="size-4" />
        </Link>
      </div>
      <p className="mb-3 text-[11px] text-text-muted">Сүүлийн дагалт бүртгэл</p>

      <div className="mb-4 flex items-center gap-2.5">
        <p className="text-[28px] font-bold leading-none tracking-tight text-text-base">
          {flagged.length}
          <span className="ml-1.5 text-[15px] font-medium text-text-muted">хүлээгдэж буй</span>
        </p>
        {resolvePct > 0 && (
          <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-fg)' }}>
            +{resolvePct}%
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {preview.map((f, i) => (
          <div
            key={f.id ?? i}
            title={f.childName ?? f.childKey}
            className="btn size-9 shrink-0 cursor-default rounded-full border-2 border-surface flex items-center justify-center text-[11px] font-bold text-white transition-transform duration-150 hover:scale-110"
            style={{ backgroundColor: STATUS_COLOR[f.status] ?? '#8E8E93' }}
          >
            {(f.childName ?? f.childKey ?? '?').slice(0, 1).toUpperCase()}
          </div>
        ))}
        {extra > 0 && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-surface bg-surface-raised">
            <span className="text-[10px] font-semibold text-text-muted">+{extra}</span>
          </div>
        )}
        {followUps.length === 0 && (
          <p className="text-[12px] text-text-muted">Дагалт бүртгэл байхгүй</p>
        )}
      </div>
    </div>
  )
}

export default FollowUpSummaryCard
