'use client'

import { useState } from 'react'
import { PencilSquareIcon, CalendarDaysIcon } from '@heroicons/react/24/solid'
import DentistProfileEditModal from './DentistProfileEditModal'
import DentistAvailabilityModal from './DentistAvailabilityModal'
import type { VolunteerDentist } from '@/hooks/useHelp'

type Props = { profile: VolunteerDentist; specialtyLabel: string | null; onToggle: () => void }

// Purpose-built dentist profile (gold, no admin coverage ring): avatar · name ·
// specialty · availability toggle. Fills its column height via justify-between.
const DentistProfileCard = ({ profile, specialtyLabel, onToggle }: Props) => {
  const [editing, setEditing] = useState(false)
  const [avail, setAvail] = useState(false)
  const initials = profile.displayName.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2)
  const ok = profile.isAvailable

  return (
    <div className="relative flex h-full flex-col justify-between gap-5 rounded-3xl bg-gradient-to-br from-primary via-[#F5C842] to-primary-hover p-6 shadow-(--shadow-card)">
      <button onClick={() => setEditing(true)} aria-label="Засах" className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-black/10 text-text-on-primary transition hover:bg-black/20">
        <PencilSquareIcon className="size-4" />
      </button>

      <div className="flex items-center gap-3 pr-8">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.displayName} className="size-14 shrink-0 rounded-2xl object-cover" />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-black/10 text-[18px] font-bold text-text-on-primary">{initials}</div>
        )}
        <div className="min-w-0">
          <p className="truncate text-[17px] font-bold text-text-on-primary">{profile.displayName}</p>
          {specialtyLabel && <p className="truncate text-[12px] font-medium text-text-on-primary/70">{specialtyLabel}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <button onClick={() => setAvail(true)} className="btn flex items-center justify-center gap-1.5 rounded-full bg-black/10 py-2 text-[12px] font-semibold text-text-on-primary transition hover:bg-black/20">
          <CalendarDaysIcon className="size-4" /> Цагийн хуваарь тохируулах
        </button>
        <button onClick={onToggle} className={`btn flex items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-semibold transition ${ok ? 'bg-white/90 text-triage-green' : 'bg-black/15 text-text-on-primary/80'}`}>
          <span className={`size-2 rounded-full ${ok ? 'bg-triage-green' : 'bg-text-on-primary/50'}`} />
          {ok ? 'Боломжтой' : 'Завгүй'}
        </button>
      </div>

      {editing && <DentistProfileEditModal profile={profile} onClose={() => setEditing(false)} />}
      {avail && <DentistAvailabilityModal onClose={() => setAvail(false)} />}
    </div>
  )
}

export default DentistProfileCard
