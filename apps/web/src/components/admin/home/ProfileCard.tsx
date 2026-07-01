'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRightIcon } from '@heroicons/react/24/solid'
import { useMe } from '@/hooks/useMe'
import { useStats } from '@/hooks/useStats'
import { useSeason } from '@/components/shared/SeasonProvider'
import PlayCard from '@/components/ui/PlayCard'
import ProgressRing from '@/components/ui/ProgressRing'
import ProfileModal from './ProfileModal'

const initials = (name?: string) =>
  (name ?? '').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'

const ProfileCard = () => {
  const { seasonId } = useSeason()
  const { data: me } = useMe()
  const { data: stats } = useStats({ seasonId })
  const [open, setOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => { setAvatarUrl(localStorage.getItem('toothlings.avatar')) }, [])

  const screened = stats?.coverage.screened ?? 0
  const total    = stats?.coverage.total ?? 0
  const pct      = total > 0 ? Math.round((screened / total) * 100) : 0

  return (
    <>
      <PlayCard tone="dark" delay={0} grow={false}>
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary text-[15px] font-bold text-text-on-primary">
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initials(me?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-bold">{me?.name ?? '—'}</h3>
            <p className="truncate text-[12px] opacity-70">{me?.email ?? '—'}</p>
          </div>
          <button
            type="button"
            aria-label="Миний мэдээлэл"
            onClick={() => setOpen(true)}
            className="tap flex size-9 shrink-0 items-center justify-center rounded-full bg-black/10 text-current transition-colors hover:bg-black/20"
          >
            <ArrowUpRightIcon className="size-[18px] icon-spin" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <ProgressRing pct={pct} size={86} stroke={9} track="rgba(255,255,255,0.14)" bar="var(--color-primary)">
            <span className="stat-rise text-[20px] font-bold leading-none">{pct}%</span>
          </ProgressRing>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide opacity-60">Хянасан</p>
            <p className="mt-0.5 text-[15px] font-bold tabular-nums">{screened} / {total}</p>
            <p className="mt-1 text-[11px] opacity-70">нийт хүүхэд</p>
          </div>
        </div>
      </PlayCard>

      <ProfileModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export default ProfileCard
