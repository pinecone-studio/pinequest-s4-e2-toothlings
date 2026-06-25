import { cn } from '@/lib/utils'

/** Warm minimalist design tokens */
export const WARM = {
  bg: '#FAF8F5',
  chrome: '#F0EBE3',
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
      'rounded-3xl border border-black/[0.04] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)]',
      glass && 'border-white/60 bg-white/75 backdrop-blur-xl',
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
    <h3 className="text-[22px] font-bold tracking-tight text-slate-900">{title}</h3>
    {subtitle ? <p className="max-w-2xl text-[14px] leading-relaxed text-slate-500">{subtitle}</p> : null}
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
  <li className={cn('flex items-center gap-3 py-3.5 text-[14px] text-slate-600', className)}>
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F3B900]/10 text-[#B8860B]">
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
      <p className="text-[14px] font-medium text-slate-900">{title}</p>
      {description ? <p className="mt-0.5 text-[13px] text-slate-500">{description}</p> : null}
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
      'bg-[#F3B900] text-slate-900 font-semibold shadow-[0_2px_8px_rgba(243,185,0,0.25)] hover:bg-[#E5AD00] active:scale-[0.98]',
    secondary:
      'border border-[#E8E4DA] bg-white text-slate-700 font-semibold hover:border-slate-300 hover:bg-[#FAF8F5]',
    ghost: 'text-slate-500 font-medium hover:bg-white/80 hover:text-slate-800',
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
        ? 'bg-[#F3B900] text-slate-900 shadow-[0_2px_8px_rgba(243,185,0,0.2)]'
        : 'bg-white text-slate-500 ring-1 ring-[#E8E4DA] hover:text-slate-700',
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
      'inline-flex items-center rounded-full bg-white px-4 py-2 text-[13px] font-medium text-slate-600 ring-1 ring-[#E8E4DA] transition-all duration-200 hover:text-slate-900 hover:ring-slate-300',
      className,
    )}
  >
    {label}
  </a>
)

export const DetectedRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-2xl border border-black/[0.04] bg-white px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
    <span className="text-[14px] font-medium text-slate-800">{label}</span>
    <span className="font-mono text-[14px] font-semibold text-slate-600">{value}</span>
  </div>
)
