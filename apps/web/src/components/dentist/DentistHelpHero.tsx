'use client'

import { SPECIALTY_LABEL } from '@/components/admin/help/DentistProfileCard'
import DentistProfileCard from './DentistProfileCard'
import DentistCalendar from './DentistCalendar'
import NumbersCard from './NumbersCard'
import type { VolunteerDentist } from '@/hooks/useHelp'
import type { AppointmentRow } from '@/hooks/useAppointments'

type Props = { profile: VolunteerDentist; appts: AppointmentRow[]; onToggle: () => void }

// Top bar — 3 balanced, equal-height sections: profile · calendar · numbers.
const DentistHelpHero = ({ profile, appts, onToggle }: Props) => (
  <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-stretch">
    <DentistProfileCard
      profile={profile}
      specialtyLabel={profile.specialty ? (SPECIALTY_LABEL[profile.specialty] ?? profile.specialty) : null}
      onToggle={onToggle}
    />
    <DentistCalendar appts={appts} />
    <NumbersCard appts={appts} />
  </div>
)

export default DentistHelpHero
