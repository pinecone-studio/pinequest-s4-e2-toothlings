'use client'

import { useState, useEffect } from 'react'
import { ChartBarIcon } from '@heroicons/react/24/solid'
import { useTimeseries } from '@/hooks/useStats'
import { useSeason } from '@/components/shared/SeasonProvider'
import { SkeletonChart } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import PlayCard from '@/components/ui/PlayCard'
import ScreeningPlot from './ScreeningPlot'

// School year runs over three terms; a school is screened ~once per term.
const SEASONS = [
  { key: 'fall', label: 'Намар' },
  { key: 'winter', label: 'Өвөл' },
  { key: 'spring', label: 'Хавар' },
] as const
type SeasonKey = (typeof SEASONS)[number]['key']

const ScreeningBarChart = () => {
  const { seasonId } = useSeason()
  const year = seasonId?.match(/^\d{4}/)?.[0] ?? `${new Date().getFullYear()}`
  const [season, setSeason] = useState<SeasonKey>(
    SEASONS.find((s) => seasonId?.endsWith(s.key))?.key ?? 'fall',
  )
  // Sync season with the loaded seasonId (useState initializes before API responds).
  useEffect(() => {
    const derived = SEASONS.find((s) => seasonId?.endsWith(s.key))?.key
    if (derived) setSeason(derived)
  }, [seasonId])
  const { data, isLoading } = useTimeseries('CAL', `${year}-${season}`)

  if (isLoading) return <SkeletonChart />

  const buckets = data?.buckets ?? []
  const totalScreened = buckets.reduce((s, b) => s + b.screened, 0)
  const totalFlagged = buckets.reduce((s, b) => s + b.flagged, 0)
  const hasData = totalScreened > 0

  return (
    <PlayCard tone="surface" delay={1} className="flex min-h-[340px] flex-col transition-shadow duration-200">
      <div className="mb-1 flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-text-base">Үзүүлэлт</h2>
          <div className="mt-1 flex gap-4 text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Хийсэн {totalScreened}</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-triage-yellow" />Тэмдэглэсэн {totalFlagged}</span>
          </div>
        </div>
        <div className="flex overflow-hidden rounded-full border border-border bg-surface-raised p-0.5" role="group" aria-label="Улирал">
          {SEASONS.map((s) => (
            <button key={s.key} onClick={() => setSeason(s.key)} aria-pressed={season === s.key}
              className={`btn rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-150 ${season === s.key ? 'bg-text-base text-surface shadow-sm' : 'text-text-muted hover:text-text-base'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState Icon={ChartBarIcon} title="Үзүүлэлт мэдээлэл алга" hint="Энэ улирлын үзүүлэлт ирэхэд энд харагдана." />
        </div>
      ) : (
        <ScreeningPlot buckets={buckets} />
      )}
    </PlayCard>
  )
}

export default ScreeningBarChart
