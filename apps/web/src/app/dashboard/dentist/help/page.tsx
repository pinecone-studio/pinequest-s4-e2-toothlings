'use client'

import BrandLoader from '@/components/ui/BrandLoader'
import { useVolunteerProfile } from '@/hooks/useHelp'
import { useMyAppointments } from '@/hooks/useAppointments'
import DentistRegisterForm from '@/components/dentist/DentistRegisterForm'
import DentistCallBoard from '@/components/dentist/DentistCallBoard'
import DentistAvailabilityToggle from '@/components/dentist/DentistAvailabilityToggle'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'

const DentistHelpPage = () => {
  const { data: profile, isLoading: profileLoading } = useVolunteerProfile()
  const { data: appts = [], isLoading } = useMyAppointments()

  useSetPageHeader({
    title: 'Эмчийн самбар',
    subtitle: 'Зөвхөн яаралтай эмчилгээ шаардлагатай дүгнэлт гарсан сурагчид дуудлага хийх боломжтой.',
    actions: <DentistAvailabilityToggle />,
  })

  if (profileLoading) return <BrandLoader className="py-20" />
  if (!profile) return <DentistRegisterForm />

  return (
    <section className="page-in-wrap">
      {isLoading ? <BrandLoader className="py-20" /> : <DentistCallBoard appts={appts} />}
    </section>
  )
}

export default DentistHelpPage
