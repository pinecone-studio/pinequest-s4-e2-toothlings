'use client'

import Link from 'next/link'
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

type PageHeaderProps = {
  title: string
  subtitle?: string
  backHref?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  eyebrow?: string
}

export const PageHeader = ({ title, subtitle, backHref, breadcrumbs, eyebrow }: PageHeaderProps) => {
  return (
    <div className="mb-10">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-[12px] text-slate-500">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 ? <ChevronRightIcon className="size-3" /> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-[#F3B900]">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-900">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      <div className="flex items-start gap-4">
        {backHref ? (
          <Link
            href={backHref}
            className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-black/[0.04] bg-white text-slate-600 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-200 hover:bg-[#FAF8F5]"
            aria-label="Буцах"
          >
            <ArrowLeftIcon className="size-4" />
          </Link>
        ) : null}
        <div>
          {eyebrow ? <p className="warm-section-label mb-2">{eyebrow}</p> : null}
          <h2 className="text-[28px] font-bold tracking-tight text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  )
}

export const AppShell = ({
  title,
  subtitle,
  backHref,
  eyebrow,
  children,
}: {
  title: string
  subtitle?: string
  backHref?: string
  eyebrow?: string
  children: React.ReactNode
}) => (
  <div className="mx-auto w-full max-w-5xl">
    <PageHeader title={title} subtitle={subtitle} backHref={backHref} eyebrow={eyebrow} />
    {children}
  </div>
)

export const FlowCard = ({
  href,
  title,
  desc,
  emoji,
  accent = 'default',
}: {
  href: string
  title: string
  desc: string
  emoji: string
  accent?: 'default' | 'dark' | 'gold'
}) => {
  const accentCls =
    accent === 'dark'
      ? 'bg-slate-900 text-white hover:opacity-95'
      : accent === 'gold'
        ? 'bg-[#F3B900] text-slate-900 hover:bg-[#E5AD00]'
        : 'bg-white text-slate-900 hover:bg-[#FAF8F5]'

  const descCls = accent === 'default' ? 'text-slate-500' : 'text-slate-800/70'

  return (
    <Link
      href={href}
      className={`warm-card group flex min-h-[128px] flex-col justify-between p-6 transition-all duration-200 ${accentCls}`}
    >
      <span className="text-3xl">{emoji}</span>
      <span>
        <span className="block text-[16px] font-semibold">{title}</span>
        <span className={`mt-1 block text-[13px] leading-relaxed ${descCls}`}>{desc}</span>
      </span>
    </Link>
  )
}

export const StatusPill = ({
  label,
  tone,
}: {
  label: string
  tone: 'green' | 'yellow' | 'red' | 'neutral'
}) => {
  const cls =
    tone === 'green'
      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
      : tone === 'yellow'
        ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
        : tone === 'red'
          ? 'bg-red-50 text-red-600 ring-1 ring-red-100'
          : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200/60'

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  )
}

export const StatCard = ({
  label,
  value,
  hint,
  progress,
}: {
  label: string
  value: string
  hint?: string
  progress?: number
}) => (
  <div className="warm-card p-6">
    <p className="warm-section-label">{label}</p>
    <p className="mt-2 text-[28px] font-bold tracking-tight text-slate-900">{value}</p>
    {hint ? <p className="mt-1 text-[13px] text-slate-500">{hint}</p> : null}
    {progress !== undefined ? (
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F0EBE3]">
        <div
          className="h-full rounded-full bg-[#F3B900] transition-all"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    ) : null}
  </div>
)
