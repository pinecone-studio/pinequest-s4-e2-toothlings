'use client'

import { ClockIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import type { VolunteerDentist } from '@/hooks/useHelp'

type Props = { dentist: VolunteerDentist; onPick: () => void; disabled?: boolean }

// Compact horizontal roster row (avatar → name → specialty → experience/availability)
// for the board's right-side panel. Busy dentists render dimmed and are not pickable.
export const DentistRosterCard = ({ dentist, onPick, disabled }: Props) => {
  const available = dentist.isAvailable
  const clickable = available && !disabled
  const initials = dentist.displayName.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2)

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={!clickable}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
        clickable ? 'border-border bg-surface hover:border-primary hover:shadow-(--shadow-card)' : 'cursor-not-allowed border-border bg-surface opacity-55'
      }`}
    >
      <div className="relative size-11 shrink-0">
        {dentist.avatarUrl ? (
          <img src={dentist.avatarUrl} alt={dentist.displayName} className="size-11 rounded-full object-cover" />
        ) : (
          <div className="flex size-11 items-center justify-center rounded-full bg-primary-subtle text-[13px] font-bold text-primary">{initials}</div>
        )}
        <span className={`absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-surface ${available ? 'bg-triage-green' : 'bg-text-muted'}`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-text-base">{dentist.displayName}</p>
        {dentist.specialty && (
          <span className="mt-0.5 inline-block max-w-full truncate rounded-full bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-text-muted">{dentist.specialty}</span>
        )}
        <div className="mt-1 flex items-center gap-1 text-[11px] text-text-muted">
          <ClockIcon className="size-3" />
          <span>{dentist.experienceYears != null ? `${dentist.experienceYears} жил` : 'Сайн дурын'}</span>
          <span className={available ? 'text-triage-green' : 'text-text-muted'}>· {available ? 'Боломжтой' : 'Завгүй'}</span>
        </div>
      </div>

      {available && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-triage-red px-3 py-1.5 text-[12px] font-semibold text-white">
          <VideoCameraIcon className="size-3.5" /> Холбогдох
        </span>
      )}
    </button>
  )
}
