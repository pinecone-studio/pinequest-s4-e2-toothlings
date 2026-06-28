'use client'

import type { VolunteerDentist } from '@/hooks/useHelp'

export const SPECIALTY_LABEL: Record<string, string> = {
  endodontics: 'Endodontics',
  oral_surgery: 'Oral Surgery',
  operative: 'Operative',
  pediatric: 'Pediatric',
  prosthodontics: 'Prosthodontics',
  periodontics: 'Periodontics',
}

type Props = {
  dentist: VolunteerDentist
  onConnect?: () => void
  connecting?: boolean
  active?: boolean
}

export const DentistProfileCard = ({ dentist, onConnect, connecting, active }: Props) => {
  const initials = dentist.displayName
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const specialtyLabel = dentist.specialty ? (SPECIALTY_LABEL[dentist.specialty] ?? dentist.specialty) : null

  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${active ? 'border-primary bg-primary-subtle' : 'border-border bg-surface'}`}>
      {dentist.avatarUrl ? (
        <img
          src={dentist.avatarUrl}
          alt={dentist.displayName}
          className="size-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-[15px] font-bold text-primary">
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-text-base">{dentist.displayName}</p>
        {specialtyLabel && (
          <span className="mt-0.5 inline-block rounded-full bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-text-muted">
            {specialtyLabel}
          </span>
        )}
        {dentist.area && (
          <p className="mt-0.5 truncate text-[11px] text-text-muted">{dentist.area}</p>
        )}
      </div>
      {onConnect && (
        <button
          onClick={onConnect}
          disabled={connecting}
          className="shrink-0 rounded-xl bg-triage-red px-3 py-2 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          📹 Холбогдох
        </button>
      )}
    </div>
  )
}
