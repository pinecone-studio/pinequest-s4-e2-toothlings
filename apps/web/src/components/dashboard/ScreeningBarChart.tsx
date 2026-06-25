'use client'

import { useState } from 'react'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { useTimeseries } from '@/hooks/useStats'
import { useSeason } from '@/components/SeasonProvider'
import { SkeletonChart } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

type Range = 'D' | 'W' | 'M' | 'Y'
const RANGES: Range[] = ['D', 'W', 'M', 'Y']
const W = 600, H = 200, PAD_X = 12, PAD_TOP = 16, PAD_BOT = 26

const smoothPath = (pts: { x: number; y: number }[]) => {
  if (pts.length < 2) return ''
  const d = [`M ${pts[0].x},${pts[0].y}`]
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    d.push(`C ${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6},${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`)
  }
  return d.join(' ')
}

const fmtLabel = (ts: string, r: Range) => {
  const d = new Date(ts)
  if (r === 'D') return d.toLocaleDateString('mn-MN', { day: 'numeric' })
  if (r === 'W') return d.toLocaleDateString('mn-MN', { month: 'numeric', day: 'numeric' })
  if (r === 'M') return d.toLocaleDateString('mn-MN', { month: 'short' })
  return d.toLocaleDateString('mn-MN', { year: 'numeric' })
}

const ScreeningBarChart = () => {
  const [range, setRange] = useState<Range>('M')
  const { seasonId } = useSeason()
  const { data, isLoading } = useTimeseries(range, seasonId)

  if (isLoading || !data) return <SkeletonChart />

  const buckets = data.buckets
  const totalScreened = buckets.reduce((s, b) => s + b.screened, 0)
  const totalFlagged  = buckets.reduce((s, b) => s + b.flagged, 0)
  const hasData = totalScreened > 0
  const n = buckets.length
  const yMax = Math.ceil(Math.max(...buckets.map((b) => b.screened), 1) * 1.2) || 1
  const xAt = (i: number) => PAD_X + (i / Math.max(n - 1, 1)) * (W - PAD_X * 2)
  const yAt = (v: number) => PAD_TOP + (1 - v / yMax) * (H - PAD_TOP - PAD_BOT)

  const screened = buckets.map((b, i) => ({ x: xAt(i), y: yAt(b.screened) }))
  const flagged  = buckets.map((b, i) => ({ x: xAt(i), y: yAt(b.flagged) }))
  const line = smoothPath(screened)
  const bottom = H - PAD_BOT
  const area = line && `${line} L ${screened[n - 1].x},${bottom} L ${screened[0].x},${bottom} Z`

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-(--shadow-card) transition-shadow duration-200 hover:shadow-(--shadow-card-lg)" style={{ minHeight: 340 }}>
      <div className="mb-1 flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-text-base">Скрининг идэвх</h2>
          <div className="mt-1 flex gap-4 text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Хийсэн {totalScreened}</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-triage-yellow" />Тэмдэглэсэн {totalFlagged}</span>
          </div>
        </div>
        <div className="flex overflow-hidden rounded-full border border-border bg-surface-raised p-0.5" role="group" aria-label="Хугацааны хязгаар">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)} aria-pressed={range === r}
              className={`btn rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-150 ${range === r ? 'bg-text-base text-surface shadow-sm' : 'text-text-muted hover:text-text-base'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState Icon={ChartBarIcon} title="Скрининг мэдээлэл алга" hint="Анхны скрининг ирэхэд идэвхийн график энд харагдана." />
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-end">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 240 }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.30" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <line key={g} x1={PAD_X} x2={W - PAD_X} y1={PAD_TOP + g * (H - PAD_TOP - PAD_BOT)} y2={PAD_TOP + g * (H - PAD_TOP - PAD_BOT)} stroke="var(--color-border-muted)" strokeWidth="1" strokeDasharray="3 5" />
            ))}
            <path d={area} fill="url(#areaFill)" />
            <path d={line} fill="none" stroke="var(--color-primary)" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            <path d={smoothPath(flagged)} fill="none" stroke="var(--color-triage-yellow)" strokeWidth="2" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          </svg>
          <div className="mt-1 flex justify-between px-1">
            {buckets.map((b) => (
              <span key={b.ts} className="flex-1 text-center text-[9px] leading-tight text-text-muted">{fmtLabel(b.ts, range)}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ScreeningBarChart
