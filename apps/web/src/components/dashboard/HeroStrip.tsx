'use client'

import { useSession } from '@/components/providers'
import { useStats } from '@/hooks/useStats'
import StatChip from './StatChip'

const HeroStrip = () => {
  const { role } = useSession()
  const { data: stats } = useStats()

  const pendingReview = stats?.pendingReview ?? 0
  const redCount = stats?.triage.red ?? 0
  const flagged = stats?.flaggedFollowUps ?? 0

  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      <p className="mb-4 text-lg font-semibold text-text-base">
        {role === 'admin' && 'Самбар'}
        {role === 'dentist' && 'Хяналтын дараалал'}
        {role === 'follow_up' && 'Дагах жагсаалт'}
      </p>

      <div className="flex flex-wrap gap-3">
        {(role === 'admin' || role === 'dentist') && (
          <>
            <StatChip label="Хянах скрининг" value={pendingReview} href="/dentist" />
            <StatChip
              label="Улаан (яаралтай)"
              value={redCount}
              tone={redCount > 0 ? 'red' : 'neutral'}
              href="/dentist"
            />
          </>
        )}
        {(role === 'admin' || role === 'follow_up') && (
          <StatChip
            label="Дагах хүлээж буй"
            value={flagged}
            tone={flagged > 0 ? 'yellow' : 'neutral'}
            href="/follow-up"
          />
        )}
        {role === 'admin' && stats && (
          <StatChip
            label={`Хамрагдалт ${stats.coverage.total > 0 ? Math.round((stats.coverage.screened / stats.coverage.total) * 100) : 0}%`}
            value={`${stats.coverage.screened}/${stats.coverage.total}`}
            tone="neutral"
          />
        )}
      </div>
    </div>
  )
}

export default HeroStrip
