'use client'

import { ClockIcon } from '@heroicons/react/24/outline'
import type { VolunteerDentist } from '@/hooks/useHelp'

type Props = {
  dentist: VolunteerDentist
  onPick: () => void
  selected?: boolean
}

// Profile card (avatar → name → specialty → experience → availability bar) styled
// like the reference card. Busy dentists render dimmed and are not pickable.
export const DentistPanelCard = ({ dentist, onPick, selected }: Props) => {
  const available = dentist.isAvailable
  const initials = dentist.displayName.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2)

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={!available}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected ? 'border-primary bg-primary-subtle' : 'border-border bg-surface'
      } ${available ? 'hover:border-primary hover:shadow-(--shadow-card)' : 'cursor-not-allowed opacity-55'}`}
    >
      <div className="relative size-12">
        {dentist.avatarUrl ? (
          <img src={dentist.avatarUrl} alt={dentist.displayName} className="size-12 rounded-full object-cover" />
        ) : (
          <div className="flex size-12 items-center justify-center rounded-full bg-primary-subtle text-[15px] font-bold text-primary">
            {initials}
          </div>
        )}
        <span className={`absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 border-surface ${available ? 'bg-triage-green' : 'bg-text-muted'}`} />
      </div>

      <p className="mt-2.5 truncate text-[14px] font-semibold text-text-base">{dentist.displayName}</p>
      {dentist.specialty && <p className="truncate text-[11px] text-text-muted">{dentist.specialty}</p>}

      <div className="mt-2 flex items-center gap-1 text-[12px] text-text-muted">
        <ClockIcon className="size-3.5" />
        <span>{dentist.experienceYears != null ? `${dentist.experienceYears} жил туршлага` : 'Сайн дурын эмч'}</span>
      </div>

      <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-border">
        <span className={`h-1.5 grow-[7] ${available ? 'bg-triage-green' : 'bg-text-muted'}`} />
        <span className={`h-1.5 grow-[3] ${available ? 'bg-primary' : 'bg-border'}`} />
      </div>
      <p className={`mt-1.5 text-[11px] font-medium ${available ? 'text-triage-green' : 'text-text-muted'}`}>
        {available ? '● Боломжтой' : '● Завгүй'}
      </p>
    </button>
  )
}
