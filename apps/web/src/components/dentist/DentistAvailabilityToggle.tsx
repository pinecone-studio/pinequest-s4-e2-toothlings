'use client'

import { PhoneIcon } from '@heroicons/react/24/solid'
import { useVolunteerProfile, useUpsertVolunteer } from '@/hooks/useHelp'

// Compact availability switch shown in the page header. Self-contained so it stays
// reactive even though the header captures it once.
const DentistAvailabilityToggle = () => {
  const { data: profile } = useVolunteerProfile()
  const upsert = useUpsertVolunteer()
  if (!profile) return null

  const on = profile.isAvailable
  const toggle = () =>
    upsert.mutate({
      displayName: profile.displayName,
      specialty: profile.specialty ?? undefined,
      org: profile.org ?? undefined,
      area: profile.area ?? undefined,
      isAvailable: !on,
    })

  const label = on ? 'Дуудлага хийх боломжтой' : 'Боломжгүй'

  return (
    <button onClick={toggle} disabled={upsert.isPending} role="switch" aria-checked={on} aria-label={label}
      title={label}
      className={`btn flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition disabled:opacity-60 ${
        on ? 'border-triage-green/30 bg-triage-green-bg text-triage-green' : 'border-border bg-surface-raised text-text-muted'
      }`}>
      <PhoneIcon className="size-3.5 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? 'bg-triage-green' : 'bg-text-muted/30'}`}>
        <span className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? 'translate-x-4' : 'translate-x-0'}`} />
      </span>
    </button>
  )
}

export default DentistAvailabilityToggle
