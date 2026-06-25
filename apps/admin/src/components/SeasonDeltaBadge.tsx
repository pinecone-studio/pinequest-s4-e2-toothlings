// Maps to packages/types LongitudinalFlag; display layer only
export type Delta = 'worsened' | 'stable' | 'improved' | 'new' | 'unscreened'

const CONFIG: Record<Delta, { symbol: string; label: string; cls: string }> = {
  worsened:   { symbol: '↑', label: 'хүнд',    cls: 'text-triage-red' },
  stable:     { symbol: '→', label: 'адил',    cls: 'text-text-muted' },
  improved:   { symbol: '↓', label: 'сайжр',   cls: 'text-triage-green' },
  new:        { symbol: '•', label: 'шинэ',    cls: 'text-primary' },
  unscreened: { symbol: '—', label: '',        cls: 'text-text-muted' },
}

type Props = { delta: Delta; className?: string }

const SeasonDeltaBadge = ({ delta, className = '' }: Props) => {
  const { symbol, label, cls } = CONFIG[delta]
  return (
    <span className={`text-xs font-medium tabular-nums ${cls} ${className}`}>
      {symbol}{label ? ` ${label}` : ''}
    </span>
  )
}

export default SeasonDeltaBadge
