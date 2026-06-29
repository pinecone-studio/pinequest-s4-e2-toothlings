import { cn } from '@/lib/utils'

/** Warm minimalist design tokens */
export const WARM = {
  bg: '#EDEDED',
  chrome: '#E8E8E8',
  accent: '#F3B900',
  cardShadow: 'shadow-[0_4px_20px_rgba(0,0,0,0.02)]',
} as const

export const FlatCard = ({
  children,
  className,
  glass,
}: {
  children: React.ReactNode
  className?: string
  glass?: boolean
}) => (
  <div
    className={cn(
      'rounded-2xl border border-border-muted bg-surface shadow-[var(--shadow-card)]',
      glass && 'border-border/50 bg-surface/90 backdrop-blur-xl dark:bg-surface/75',
      className,
    )}
  >
    {children}
  </div>
)

export const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  className?: string
}) => (
  <div className={cn('space-y-1', className)}>
    {eyebrow ? <p className="warm-section-label">{eyebrow}</p> : null}
    <h3 className="text-[22px] font-bold tracking-tight text-text-base">{title}</h3>
    {subtitle ? <p className="max-w-2xl text-[14px] leading-relaxed text-text-muted">{subtitle}</p> : null}
  </div>
)

export const FeatureRow = ({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode
  label: string
  className?: string
}) => (
  <li className={cn('flex items-center gap-3 py-3.5 text-[14px] text-text-muted', className)}>
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F3B900]/10 text-[#B8860B] dark:text-primary">
      {icon}
    </span>
    {label}
  </li>
)

export const SettingRow = ({
  title,
  description,
  control,
}: {
  title: string
  description?: string
  control: React.ReactNode
}) => (
  <div className="flex items-center justify-between gap-4 px-1 py-4">
    <div className="min-w-0">
      <p className="text-[14px] font-medium text-text-base">{title}</p>
      {description ? <p className="mt-0.5 text-[13px] text-text-muted">{description}</p> : null}
    </div>
    <div className="shrink-0">{control}</div>
  </div>
)

export const PillButton = ({
  children,
  variant = 'primary',
  className,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}) => {
  const variants = {
    primary:
      'bg-primary text-text-on-primary font-semibold shadow-[0_2px_8px_rgba(242,183,5,0.25)] hover:bg-primary-hover active:scale-[0.98]',
    secondary:
      'border border-border bg-surface-raised text-text-base font-semibold hover:bg-surface hover:border-border',
    ghost: 'text-text-muted font-medium hover:bg-surface-raised hover:text-text-base',
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export const FilterPill = ({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'rounded-full px-5 py-2 text-[13px] font-semibold transition-all duration-200',
      active
        ? 'bg-primary text-text-on-primary shadow-[0_2px_8px_rgba(242,183,5,0.25)]'
        : 'bg-surface-raised text-text-muted ring-1 ring-border hover:text-text-base',
    )}
  >
    {label}
  </button>
)

export const AnchorPill = ({
  href,
  label,
  className,
}: {
  href: string
  label: string
  className?: string
}) => (
  <a
    href={href}
    className={cn(
      'inline-flex items-center rounded-full bg-surface-raised px-4 py-2 text-[13px] font-medium text-text-muted ring-1 ring-border transition-all duration-200 hover:text-text-base hover:ring-border',
      className,
    )}
  >
    {label}
  </a>
)

export const DetectedRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-2xl border border-border-muted bg-surface-raised px-5 py-4">
    <span className="text-[14px] font-medium text-text-base">{label}</span>
    <span className="font-mono text-[14px] font-semibold text-text-muted">{value}</span>
  </div>
)
