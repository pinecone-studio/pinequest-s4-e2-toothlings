'use client'

import { useState } from 'react'
import type { TsBucket } from '@/hooks/useStats'

const W = 600, H = 200, PAD_X = 12, PAD_TOP = 16, PAD_BOT = 26, SVG_PX = 240
const F = SVG_PX / H

const smoothPath = (pts: { x: number; y: number }[]) => {
  if (pts.length < 2) return ''
  const d = [`M ${pts[0].x},${pts[0].y}`]
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    d.push(`C ${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6},${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`)
  }
  return d.join(' ')
}

const monthOf = (ts: string) => new Date(ts).getUTCMonth() + 1

const ScreeningPlot = ({ buckets }: { buckets: TsBucket[] }) => {
  const [hover, setHover] = useState<number | null>(null)
  const n = buckets.length

  // Kid-count Y axis, rounded up to a multiple of 4 so the 4 ticks stay whole.
  const peak = Math.max(...buckets.map((b) => b.screened), 1)
  const yMax = Math.max(4, Math.ceil(peak / 4) * 4)
  const xAt = (i: number) => PAD_X + (i / Math.max(n - 1, 1)) * (W - PAD_X * 2)
  const yAt = (v: number) => PAD_TOP + (1 - v / yMax) * (H - PAD_TOP - PAD_BOT)

  const screened = buckets.map((b, i) => ({ x: xAt(i), y: yAt(b.screened) }))
  const line = smoothPath(screened)
  const bottom = H - PAD_BOT
  const area = line && `${line} L ${screened[n - 1].x},${bottom} L ${screened[0].x},${bottom} Z`
  const flagged = smoothPath(buckets.map((b, i) => ({ x: xAt(i), y: yAt(b.flagged) })))

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((g) => ({
    top: (PAD_TOP + g * (H - PAD_TOP - PAD_BOT)) * F,
    val: Math.round(yMax * (1 - g)),
  }))
  const active = hover !== null ? buckets[hover] : null
  const activePt = hover !== null ? screened[hover] : null

  return (
    <div className="flex flex-1 flex-col justify-end">
      <div className="flex">
        {/* Y axis unit — number of children screened */}
        <span className="mb-6 self-center rotate-180 text-[9px] font-semibold uppercase tracking-wider text-text-muted [writing-mode:vertical-rl]">Хүүхэд</span>
        <div className="relative flex-1 pl-6">
          {yTicks.map((t) => (
            <span key={t.val} style={{ top: t.top }} className="absolute left-0 -translate-y-1/2 text-[9px] tabular-nums text-text-muted">{t.val}</span>
          ))}
          <div className="relative" onMouseLeave={() => setHover(null)}>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: SVG_PX }} preserveAspectRatio="none">
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
              <path d={flagged} fill="none" stroke="var(--color-triage-yellow)" strokeWidth="2" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
            </svg>
            {/* Invisible per-month hover columns drive the tooltip. */}
            <div className="absolute inset-0 flex">
              {buckets.map((b, i) => (
                <div key={b.ts} className="flex-1 cursor-pointer" onMouseEnter={() => setHover(i)} />
              ))}
            </div>
            {/* Dot per month (HTML overlay avoids SVG stretch); the hovered one grows. */}
            {screened.map((p, i) => (
              <span key={buckets[i].ts} style={{ left: `${(p.x / W) * 100}%`, top: p.y * F }} className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_2px_var(--color-surface)] transition-all duration-150 ${hover === i ? 'size-2.5' : 'size-1.5'}`} />
            ))}
            {active && activePt && (
              <div style={{ left: `${(activePt.x / W) * 100}%`, top: activePt.y * F - 10 }} className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[100%] whitespace-nowrap rounded-lg border border-border bg-surface px-2.5 py-1.5 text-center shadow-(--shadow-card-lg)">
                <div className="text-[11px] font-semibold text-text-base">{monthOf(active.ts)}-р сар</div>
                <div className="mt-0.5 flex gap-2 text-[10px] text-text-muted">
                  <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-primary" />Хийсэн {active.screened}</span>
                  <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-triage-yellow" />Тэмдэглэсэн {active.flagged}</span>
                </div>
              </div>
            )}
          </div>
          {/* X axis — months of the school year */}
          <div className="mt-1.5 flex justify-between">
            {buckets.map((b, i) => (
              <span key={b.ts} className={`flex-1 text-center text-[10px] tabular-nums leading-none transition-colors ${hover === i ? 'font-bold text-text-base' : 'font-medium text-text-muted'}`}>{monthOf(b.ts)}</span>
            ))}
          </div>
          <div className="mt-1 text-center text-[10px] font-semibold uppercase tracking-wider text-text-muted">Сар</div>
        </div>
      </div>
    </div>
  )
}

export default ScreeningPlot
