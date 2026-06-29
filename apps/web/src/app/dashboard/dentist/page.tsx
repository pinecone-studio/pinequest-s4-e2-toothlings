import { redirect } from 'next/navigation'

// The dentist's review-queue screen was removed — land them on the call page.
const DentistIndexPage = () => {
  redirect('/dashboard/dentist/help')
}

export default DentistIndexPage
