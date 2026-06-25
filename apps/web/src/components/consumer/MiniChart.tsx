'use client'

type Point = { label: string; value: number }

const smoothPath = (pts: { x: number; y: number }[]) => {
  if (pts.length < 2) return ''
  const d = [`M ${pts[0].x},${pts[0].y}`]
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    d.push(
      `C ${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6},${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`,
    )
  }
  return d.join(' ')
}

export const MiniLineChart = ({
  data,
  title,
  subtitle,
  height = 160,
}: {
  data: Point[]
  title: string
  subtitle?: string
  height?: number
}) => {
  const W = 400
  const H = 120
  const PAD = 16
  const max = Math.max(...data.map((d) => d.value), 1)
  const pts = data.map((d, i) => ({
    x: PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2),
    y: PAD + (1 - d.value / max) * (H - PAD * 2),
  }))
  const line = smoothPath(pts)
  const bottom = H - PAD
  const area = line ? `${line} L ${pts[pts.length - 1].x},${bottom} L ${pts[0].x},${bottom} Z` : ''

  return (
    <div className="warm-card p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-[14px] font-semibold text-text-base">{title}</p>
          {subtitle ? <p className="mt-0.5 text-[12px] text-text-muted">{subtitle}</p> : null}
        </div>
        <span className="warm-pill text-[11px] font-semibold text-primary">
          {data[data.length - 1]?.value ?? 0}%
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {area ? <path d={area} fill="url(#chartFill)" /> : null}
        {line ? (
          <path d={line} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
        ) : null}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-text-muted">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}

export const MonthlyHealthChart = ({ values }: { values: number[] }) => {
  const months = ['1', '2', '3', '4', '5', '6']
  const W = 400
  const H = 140
  const PAD = 20
  const max = 100
  const barW = (W - PAD * 2) / values.length - 8

  return (
    <div className="warm-card overflow-hidden">
      <div className="border-b border-[#E8E4DA]/60 px-6 py-4">
        <p className="warm-section-label mb-1">Trend</p>
        <p className="text-[15px] font-semibold text-slate-900">Сар бүрийн шүдний эрүүл мэндийн динамик</p>
      </div>
      <div className="px-6 pb-6 pt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
          {values.map((v, i) => {
            const h = (v / max) * (H - PAD * 2)
            const x = PAD + i * (barW + 8)
            const y = H - PAD - h
            const fill = v >= 70 ? '#2A7D4F' : v >= 45 ? '#F3B900' : '#B83838'
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={h} rx={8} fill={fill} opacity={0.9} />
                <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="#94a3b8">
                  {months[i]}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
