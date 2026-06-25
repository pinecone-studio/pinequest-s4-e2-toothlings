type Props = { screened: number; total: number; className?: string }

const CoverageBar = ({ screened, total, className = '' }: Props) => {
  const pct = total === 0 ? 0 : Math.round((screened / total) * 100)
  const fillColor =
    pct < 30 ? 'bg-triage-red' : pct < 70 ? 'bg-triage-yellow' : 'bg-primary'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all duration-500 ${fillColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-14 shrink-0 text-right text-xs font-medium tabular-nums text-text-muted">
        {screened}/{total}
      </span>
    </div>
  )
}

export default CoverageBar
