'use client'

import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useMe } from '@/hooks/useMe'
import { useStats } from '@/hooks/useStats'
import { useSeason } from '@/components/SeasonProvider'
import Card from '@/components/ui/Card'

const initials = (name?: string) =>
  (name ?? '').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '—'

// Top-left identity + real cohort-coverage (screened / total active children).
const ProfileCard = () => {
  const { seasonId } = useSeason()
  const { data: me } = useMe()
  const { data: stats } = useStats({ seasonId })

  const screened = stats?.coverage.screened ?? 0
  const total    = stats?.coverage.total ?? 0
  const pct      = total > 0 ? Math.round((screened / total) * 100) : 0

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-[15px] font-bold text-text-base">
          {initials(me?.name)}
        </div>
        <div className="min-w-0 flex-1">
          <button className="btn float-right flex items-center gap-0.5 text-[11px] font-semibold text-primary">
            Дэлгэрэнгүй <ChevronDownIcon className="size-3" />
          </button>
          <h3 className="truncate text-[15px] font-bold text-text-base">{me?.name ?? 'Админ'}</h3>
          <p className="text-[12px] text-text-muted">Админ · Самбар</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="text-text-muted">Хамрагдалт</span>
          <span className="font-semibold text-text-base">{screened} / {total}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-raised">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-brand-accent))' }}
          />
        </div>
      </div>
    </Card>
  )
}

export default ProfileCard
