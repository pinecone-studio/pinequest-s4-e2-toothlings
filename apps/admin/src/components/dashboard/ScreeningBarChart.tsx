'use client'

import { useState } from 'react'
import type { DashStats } from '@/hooks/useStats'
import { SkeletonChart } from '@/components/ui/Skeleton'

type Props = { stats: DashStats | undefined }
type Bar  = { label: string; value: number }

const Y_TICKS = 4

// Calm 3-tone neutral palette — generic volume chart, not triage. The featured
// (max) bubble takes the lime highlight; others alternate the two neutral tones.
// Clinical green/yellow/red stay on the triage surfaces.
const CHART_COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)']

const ScreeningBarChart = ({ stats }: Props) => {
  const [view, setView] = useState<'uliral' | 'tarhalt'>('uliral')

  if (!stats) return <SkeletonChart />

  const bars: Bar[] = view === 'uliral'
    ? [
        { label: 'Нийт',    value: stats.totalScreened },
        { label: 'Аюулгүй', value: stats.triage.green },
        { label: 'Анхаар',  value: stats.triage.yellow },
        { label: 'Яаралтай',value: stats.triage.red },
        { label: 'Хянасан', value: stats.totalScreened - stats.pendingReview },
        { label: 'Дагах',   value: stats.flaggedFollowUps },
      ]
    : [
        { label: 'Аюулгүй',    value: stats.triage.green },
        { label: 'Анхааруулга',value: stats.triage.yellow },
        { label: 'Яаралтай',   value: stats.triage.red },
      ]

  const max  = Math.max(...bars.map((b) => b.value), 1)
  const step = Math.ceil(max / Y_TICKS)
  const yMax = step * Y_TICKS

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-(--shadow-card) transition-shadow duration-200 hover:shadow-(--shadow-card-lg)" style={{ minHeight: 340 }}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-text-base">Скрининг идэвх</h2>
          <p className="mt-0.5 text-[11px] text-text-muted">Нийт {stats.totalScreened} скрининг</p>
        </div>
        <div className="flex overflow-hidden rounded-full border border-border bg-surface-raised p-0.5">
          {(['uliral', 'tarhalt'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`btn rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all duration-150 ${
                view === v ? 'bg-text-base text-surface shadow-sm' : 'text-text-muted hover:text-text-base'
              }`}
            >
              {v === 'uliral' ? 'Улирал' : 'Тархалт'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col" style={{ minHeight: 220 }}>
        {/* Y gridlines + labels */}
        {Array.from({ length: Y_TICKS + 1 }, (_, i) => i).map((i) => (
          <div key={i} className="pointer-events-none absolute left-0 right-0 flex items-center" style={{ bottom: `${(i / Y_TICKS) * 100}%` }}>
            <span className="w-8 shrink-0 pr-2 text-right text-[10px] text-text-muted">{step * i}</span>
            <div className="flex-1 border-t border-dashed border-border-muted" />
          </div>
        ))}

        {/* Bubble plot layer */}
        <div className="absolute bottom-7 left-10 right-2 top-1">
          {bars.map((bar, idx) => {
            const isMax = bar.value === max && bar.value > 0
            const leftPct = ((idx + 0.5) / bars.length) * 100
            const bottomPct = Math.min((bar.value / yMax) * 100, 90)
            const size = bar.value === 0 ? 8 : 22 + (bar.value / max) * 50
            const color = isMax
              ? CHART_COLORS[0]
              : idx % 2 === 0 ? CHART_COLORS[2] : CHART_COLORS[1]
            return (
              <div
                key={bar.label}
                className="absolute"
                style={{ left: `${leftPct}%`, bottom: `${bottomPct}%`, width: size, height: size, transform: 'translate(-50%, 50%)' }}
              >
                <div className="absolute inset-0 rounded-full shadow-sm transition-all duration-700" style={{ backgroundColor: color }} />
                {isMax ? (
                  <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold" style={{ color: 'var(--color-accent-fg)' }}>
                    {bar.value}
                  </span>
                ) : bar.value > 0 ? (
                  <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-[10px] font-semibold text-text-muted">
                    {bar.value}
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-10 right-2 flex">
          {bars.map((bar) => (
            <span key={bar.label} className="flex-1 text-center text-[9px] leading-tight text-text-muted">
              {bar.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ScreeningBarChart
