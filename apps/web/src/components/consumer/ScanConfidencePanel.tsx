import { cn } from '@/lib/utils'

type ConfidenceItem = { label: string; confidence: number }

const pct = (n: number) => `${(n * 100).toFixed(1)}%`

const ConfidenceBar = ({ value, className }: { value: number; className?: string }) => (
  <div className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-raised', className)}>
    <div
      className="h-full rounded-full bg-[#F3B900] transition-[width] duration-700 ease-out"
      style={{ width: `${Math.min(100, Math.round(value * 100))}%` }}
    />
  </div>
)

const MaxConfidenceCard = ({ item }: { item: ConfidenceItem }) => (
  <div className="rounded-2xl border border-[#F3B900]/40 bg-[#F3B900]/10 p-5">
    <p className="text-[11px] font-bold uppercase tracking-wide text-[#B8860B] dark:text-primary">
      Хамгийн өндөр магадлал
    </p>
    <p className="mt-1.5 font-mono text-[34px] font-bold leading-none tabular-nums text-text-base">
      {pct(item.confidence)}
    </p>
    <p className="mt-2 text-[14px] font-medium text-text-base">{item.label}</p>
    <ConfidenceBar value={item.confidence} className="mt-3 bg-[#F3B900]/20" />
  </div>
)

const ConfidenceRow = ({ item }: { item: ConfidenceItem }) => (
  <div className="rounded-2xl border border-border-muted bg-surface-raised px-5 py-4">
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14px] font-medium text-text-base">{item.label}</span>
      <span className="font-mono text-[14px] font-semibold tabular-nums text-text-muted">
        {pct(item.confidence)}
      </span>
    </div>
    <ConfidenceBar value={item.confidence} className="mt-3" />
  </div>
)

/** Detected-caries confidences: highest probability featured, the rest as bars. */
export const ScanConfidencePanel = ({ items }: { items: ConfidenceItem[] }) => {
  if (!items.length) {
    return (
      <p className="rounded-2xl border border-border-muted bg-surface-raised px-5 py-4 text-[13px] text-text-muted">
        Энэ зурагт цоорлын тодорхой шинж илрээгүй.
      </p>
    )
  }
  const max = items.reduce((a, b) => (b.confidence > a.confidence ? b : a))
  const rest = items.filter((it) => it !== max)
  return (
    <div className="space-y-2">
      <MaxConfidenceCard item={max} />
      {rest.map((it) => (
        <ConfidenceRow key={it.label + it.confidence} item={it} />
      ))}
    </div>
  )
}
