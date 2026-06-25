import type { ComponentType, SVGProps } from 'react'

type Props = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  hint?: string
  compact?: boolean
}

// Shared empty-state for cards/lists with no data yet. Gold-tinted, calm,
// never alarming — "nothing here yet", not an error.
const EmptyState = ({ Icon, title, hint, compact }: Props) => (
  <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-12'}`}>
    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary-subtle">
      <Icon className="size-6 text-primary" />
    </div>
    <p className="text-[13px] font-semibold text-text-base">{title}</p>
    {hint && <p className="mt-1 max-w-[220px] text-[11px] leading-relaxed text-text-muted">{hint}</p>}
  </div>
)

export default EmptyState
