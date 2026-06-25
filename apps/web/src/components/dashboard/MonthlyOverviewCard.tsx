'use client'

import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/20/solid'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useTimeseries } from '@/hooks/useStats'
import { useSeason } from '@/components/SeasonProvider'
import { SkeletonCard } from '@/components/ui/Skeleton'

const SW = 240, SH = 48

const sparkPath = (vals: number[]) => {
  const max = Math.max(...vals, 1)
  const pts = vals.map((v, i) => `${(i / Math.max(vals.length - 1, 1)) * SW},${SH - (v / max) * SH}`)
  return 'M ' + pts.join(' L ')
}

// Filled Honey-Gold hero: children screened THIS month + % vs last month +
// sparkline. All from the real monthly time-series (no fabricated data).
const MonthlyOverviewCard = () => {
  const { seasonId } = useSeason()
  const { data, isLoading } = useTimeseries('M', seasonId)
  if (isLoading || !data) return <SkeletonCard rows={2} />

  const b = data.buckets
  const thisM = b.at(-1)?.screened ?? 0
  const lastM = b.at(-2)?.screened ?? 0
  const delta = lastM > 0 ? Math.round(((thisM - lastM) / lastM) * 100) : thisM > 0 ? 100 : 0
  const up = delta >= 0
  const Trend = up ? ArrowTrendingUpIcon : ArrowTrendingDownIcon

  return (
    <div
      className="rounded-2xl p-5 text-text-on-primary shadow-(--shadow-card)"
      style={{ background: 'linear-gradient(150deg, var(--color-primary), var(--color-brand-accent))' }}
    >
      <div className="flex items-center justify-between text-[12px] font-semibold opacity-85">
        <span>Сарын тойм</span>
        <button className="btn flex items-center gap-0.5 hover:opacity-100">Дэлгэрэнгүй <ChevronDownIcon className="size-3.5" /></button>
      </div>

      <p className="mt-2 text-[36px] font-bold leading-none tracking-tight">
        {thisM > 0 ? thisM.toLocaleString() : '—'}
      </p>
      <p className="mt-1 text-[12px] opacity-85">Энэ сард скрининг хийсэн хүүхэд</p>

      <svg viewBox={`0 0 ${SW} ${SH}`} className="mt-4 w-full" style={{ height: 44 }} preserveAspectRatio="none">
        <path d={sparkPath(b.map((x) => x.screened))} fill="none" stroke="var(--color-text-on-primary)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      </svg>

      <div className="mt-3 flex items-center gap-1.5 text-[12px] font-bold">
        <Trend className="size-4" />
        {up ? '▲' : '▼'} {Math.abs(delta)}% өнгөрсөн сараас
      </div>
    </div>
  )
}

export default MonthlyOverviewCard
