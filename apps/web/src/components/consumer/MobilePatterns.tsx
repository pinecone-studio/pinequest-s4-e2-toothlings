'use client'

import Link from 'next/link'
import { FilterPill } from '@/components/consumer/warm/WarmUI'
import { cn } from '@/lib/utils'

export const GreetingHeader = ({ name }: { name: string }) => {
  const initial = name.charAt(0).toUpperCase() || 'S'
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-[24px] font-bold tracking-tight text-text-base">Сайн уу, {name}</h2>
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-medium text-text-muted">
          <span className="size-1.5 rounded-full bg-triage-green" />
          Онлайн
        </span>
      </div>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#F3B900] text-[15px] font-bold text-slate-900">
        {initial}
      </span>
    </div>
  )
}

export const ChildrenTabRow = ({
  names,
  active,
  onSelect,
}: {
  names: string[]
  active: string
  onSelect: (name: string) => void
}) => (
  <div className="flex flex-wrap gap-2">
    {names.map((name) => (
      <FilterPill key={name} label={name} active={active === name} onClick={() => onSelect(name)} />
    ))}
  </div>
)

export const ScanHeroCard = ({ href, label = 'Зураг авах' }: { href: string; label?: string }) => (
  <Link
    href={href}
    className="flex items-center justify-between gap-4 rounded-2xl bg-[#F3B900] p-6 shadow-[0_4px_20px_rgba(243,185,0,0.35)] transition-all hover:bg-[#E5AD00]"
  >
    <div>
      <p className="text-[20px] font-bold text-slate-900">Урьдчилан сэргийлэх</p>
      <p className="mt-1 text-[14px] text-slate-900/75">Амны хөндийн байдлын хяналт</p>
    </div>
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-[14px] font-semibold text-[#F3B900]">
      📷 {label}
    </span>
  </Link>
)

const TRIAGE_DOT = {
  green: 'bg-triage-green',
  yellow: 'bg-triage-yellow',
  red: 'bg-triage-red',
} as const

export const LastScreeningCard = ({
  date,
  triage,
  summary,
  href,
}: {
  date: string
  triage: 'green' | 'yellow' | 'red'
  summary: string
  href: string
}) => (
  <Link
    href={href}
    className="warm-card flex items-center gap-4 p-4 transition-all hover:ring-2 hover:ring-[#F3B900]/30"
  >
    <span className={cn('size-3 shrink-0 rounded-full', TRIAGE_DOT[triage])} />
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
        Сүүлийн дүгнэлт
      </p>
      <p className="mt-0.5 line-clamp-2 text-[14px] font-medium text-text-base">{summary}</p>
      <p className="mt-1 text-[12px] text-text-muted">{date}</p>
    </div>
    <span className="text-text-muted">›</span>
  </Link>
)

export const QuickActionGrid = ({
  actions,
}: {
  actions: Array<{ href: string; icon: string; label: string }>
}) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {actions.map(({ href, icon, label }) => (
      <Link
        key={href}
        href={href}
        className="warm-card flex aspect-square flex-col justify-between p-4 transition-all hover:bg-surface-raised"
      >
        <span className="flex size-10 items-center justify-center rounded-2xl bg-[#F3B900]/12 text-lg">
          {icon}
        </span>
        <span className="whitespace-pre-line text-[13px] font-semibold leading-snug text-text-base">
          {label}
        </span>
      </Link>
    ))}
  </div>
)

export const TriageHeroCard = ({
  level,
  label,
  summary,
}: {
  level: 'green' | 'yellow' | 'red'
  label: string
  summary: string
}) => {
  const styles =
    level === 'green'
      ? 'bg-triage-green-bg text-triage-green'
      : level === 'yellow'
        ? 'bg-triage-yellow-bg text-triage-yellow'
        : 'bg-triage-red-bg text-triage-red'
  return (
    <div className={cn('rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]', styles)}>
      <p className="text-[20px] font-extrabold">{label}</p>
      <p className="mt-2 text-[15px] leading-relaxed opacity-90">{summary}</p>
    </div>
  )
}

export const QuestionProgress = ({ step, total }: { step: number; total: number }) => (
  <div className="mb-6">
    <div className="mb-2 flex justify-between text-[12px] font-medium text-text-muted">
      <span>
        Асуулт {step}/{total}
      </span>
      <span>{Math.round((step / total) * 100)}%</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-consumer-chrome">
      <div
        className="h-full rounded-full bg-[#F3B900] transition-all"
        style={{ width: `${(step / total) * 100}%` }}
      />
    </div>
  </div>
)

export const RadioCard = ({
  checked,
  onChange,
  label,
  name,
  value,
}: {
  checked: boolean
  onChange: () => void
  label: string
  name: string
  value: string
}) => (
  <label
    className={cn(
      'warm-card flex cursor-pointer items-center gap-3 p-4 transition-all',
      checked && 'ring-2 ring-[#F3B900]',
    )}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="size-4 accent-[#F3B900]"
    />
    <span className="text-[14px] font-medium text-text-base">{label}</span>
  </label>
)

export const ClinicListCard = ({
  name,
  rating,
  distanceKm,
  addr,
  hours,
  phone,
  active,
  onSelect,
  onNavigate,
}: {
  name: string
  rating: number
  distanceKm: number
  addr: string
  hours: string
  phone?: string
  active?: boolean
  onSelect: () => void
  onNavigate: () => void
}) => (
  <div
    className={cn(
      'warm-card flex items-center gap-3 p-4 transition-all',
      active && 'ring-2 ring-[#F3B900]',
    )}
  >
    <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
      <p className="font-semibold text-text-base">{name}</p>
      <p className="mt-0.5 text-[12px] text-text-muted">
        ★ {rating.toFixed(1)} · {distanceKm.toFixed(1)} км
      </p>
      <p className="mt-1 line-clamp-1 text-[12px] text-text-muted">{addr}</p>
      <p className="text-[11px] text-text-muted">🕐 {hours}</p>
    </button>
    <div className="flex shrink-0 gap-2">
      {phone ? (
        <a
          href={`tel:${phone.replace(/-/g, '')}`}
          className="flex size-10 items-center justify-center rounded-full bg-[#F3B900] text-slate-900 shadow-sm transition hover:bg-[#E5AD00]"
          aria-label="Залгах"
        >
          📞
        </a>
      ) : null}
      <button
        type="button"
        onClick={onNavigate}
        className="flex size-10 items-center justify-center rounded-full bg-slate-900 text-[#F3B900] shadow-sm transition hover:opacity-90"
        aria-label="Маршрут"
      >
        ↗
      </button>
    </div>
  </div>
)
