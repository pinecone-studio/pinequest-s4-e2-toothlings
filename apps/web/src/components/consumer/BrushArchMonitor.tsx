'use client'

import { useMemo } from 'react'
import {
  buildToothLayout,
  toothVisualState,
  type BrushMlState,
  type ToothLayout,
} from '@/lib/brushMl'
import { cn } from '@/lib/utils'

const TOOTH_FILL: Record<ReturnType<typeof toothVisualState>, { fill: string; stroke: string }> = {
  clean: { fill: 'url(#toothClean)', stroke: '#E2E8F0' },
  partial: { fill: 'url(#toothPartial)', stroke: '#FCD34D' },
  missed: { fill: 'url(#toothMissed)', stroke: '#38BDF8' },
}

const BrushHeadIcon = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x - 10}, ${y - 18})`} className="drop-shadow-md">
    <rect x="4" y="0" width="12" height="14" rx="3" fill="#fff" stroke="#CBD5E1" strokeWidth="1" />
    <rect x="2" y="14" width="16" height="5" rx="1.5" fill="#94A3B8" />
    <line x1="6" y1="4" x2="6" y2="11" stroke="#E2E8F0" strokeWidth="0.8" />
    <line x1="10" y1="4" x2="10" y2="11" stroke="#E2E8F0" strokeWidth="0.8" />
    <line x1="14" y1="4" x2="14" y2="11" stroke="#E2E8F0" strokeWidth="0.8" />
  </g>
)

const ToothShape = ({
  layout,
  coverage,
  active,
}: {
  layout: ToothLayout
  coverage: number
  active: boolean
}) => {
  const state = toothVisualState(coverage)
  const colors = TOOTH_FILL[state]
  return (
    <g transform={`translate(${layout.x}, ${layout.y}) rotate(${layout.rot})`}>
      <rect
        x={-layout.w / 2}
        y={-layout.h / 2}
        width={layout.w}
        height={layout.h}
        rx={layout.w * 0.35}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={active ? 2.5 : 1.2}
        className={cn('transition-all duration-300', active && 'drop-shadow-[0_0_8px_rgba(56,189,248,0.55)]')}
      />
    </g>
  )
}

export const BrushArchMonitor = ({
  mlState,
  running,
}: {
  mlState: BrushMlState
  running: boolean
}) => {
  const layouts = useMemo(() => buildToothLayout(), [])
  const coverageMap = useMemo(
    () => Object.fromEntries(mlState.teeth.map((t) => [t.id, t.coverage])),
    [mlState.teeth],
  )

  const activeLayout = layouts.find((l) => l.id === mlState.activeToothId)
  const ring = 2 * Math.PI * 46
  const progress = Math.min(100, mlState.overallCoverage)
  const dash = (progress / 100) * ring

  const missed = mlState.teeth.filter((t) => toothVisualState(t.coverage) === 'missed').length
  const partial = mlState.teeth.filter((t) => toothVisualState(t.coverage) === 'partial').length

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#7DD3FC] via-[#BAE6FD] to-[#E0F2FE] px-4 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] sm:px-8">
      <p className="text-center text-[13px] font-medium tracking-wide text-white/95 drop-shadow-sm">
        {mlState.zoneLabel}
      </p>

      <div className="relative mx-auto mt-4 max-w-md">
        <svg viewBox="0 0 400 310" className="h-auto w-full" role="img" aria-label="Шүдний угаалтын coverage">
          <defs>
            <linearGradient id="toothClean" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </linearGradient>
            <linearGradient id="toothPartial" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEF9C3" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
            <linearGradient id="toothMissed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.75" />
            </linearGradient>
            <filter id="archShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.12" />
            </filter>
          </defs>

          <ellipse cx="200" cy="155" rx="168" ry="118" fill="rgba(255,255,255,0.12)" filter="url(#archShadow)" />

          {layouts.map((layout) => (
            <ToothShape
              key={layout.id}
              layout={layout}
              coverage={coverageMap[layout.id] ?? 0}
              active={running && mlState.activeToothId === layout.id}
            />
          ))}

          {activeLayout && running ? <BrushHeadIcon x={activeLayout.x} y={activeLayout.y} /> : null}

          <circle cx="200" cy="155" r="52" fill="rgba(255,255,255,0.22)" />
          <circle cx="200" cy="155" r="46" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="6" />
          <circle
            cx="200"
            cy="155"
            r="46"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${ring}`}
            transform="rotate(-90 200 155)"
            className="transition-all duration-500"
          />
          <text x="200" y="152" textAnchor="middle" className="fill-white text-[26px] font-bold" style={{ fontSize: 26 }}>
            {progress}%
          </text>
          <text x="200" y="172" textAnchor="middle" fill="rgba(255,255,255,0.85)" style={{ fontSize: 10 }}>
            coverage
          </text>
        </svg>
      </div>

      <div className="mx-auto mt-2 flex max-w-md flex-wrap justify-center gap-4 text-[11px] font-medium text-white/90">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-white ring-1 ring-white/50" /> Угаасан
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[#FDE047]" /> Дутуу
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[#38BDF8]" /> Алгассан
        </span>
      </div>

      {!running && missed + partial > 0 ? (
        <div className="mx-auto mt-5 max-w-md rounded-2xl bg-white/25 px-4 py-3 text-center text-[12px] leading-relaxed text-white backdrop-blur-sm">
          <strong>Plaque alert:</strong> {missed} шүд бүрэн угаагдаагүй, {partial} шүд дутуу — дараагийн
          удаа цэнхэр талбарууд дээр анхаарна уу.
        </div>
      ) : null}
    </div>
  )
}
