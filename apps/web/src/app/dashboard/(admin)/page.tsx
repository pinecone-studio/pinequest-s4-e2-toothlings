'use client'

import { useScreenings } from '@/hooks/useScreenings'
import { useSeason } from '@/components/shared/SeasonProvider'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'
import ProfileCard from '@/components/admin/home/ProfileCard'
import DentistReviewQueueCard from '@/components/admin/home/DentistReviewQueueCard'
import NextFollowUpsCard from '@/components/admin/child/NextFollowUpsCard'
import ScreeningBarChart from '@/components/admin/home/ScreeningBarChart'
import ScheduleCalendar from '@/components/admin/home/ScheduleCalendar'
import RecentScreeningsTable from '@/components/admin/home/RecentScreeningsTable'
import Disclaimer from '@/components/admin/home/Disclaimer'

const AdminDashboardPage = () => {
  const { seasonId } = useSeason()
  const { data: screenings, isLoading: screeningsLoading } = useScreenings({ seasonId })

  useSetPageHeader({ title: 'Мэдээлэл', subtitle: 'Үзүүлэлт хамралт ба хяналтын тойм' })

  return (
    <div className="flex flex-col gap-5">

      {/* Top row — [left: profile + review queue] [center chart] [right: calendar + next schedule] */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_1fr_300px]">
        <div className="flex flex-col gap-5">
          <ProfileCard />
          <DentistReviewQueueCard />
        </div>

        <ScreeningBarChart />

        <div className="flex flex-col gap-5">
          <ScheduleCalendar />
          <NextFollowUpsCard />
        </div>
      </div>

      <Disclaimer />

      {/* Full-width prioritized worklist */}
      <RecentScreeningsTable screenings={screenings} loading={screeningsLoading} />
    </div>
  )
}

export default AdminDashboardPage
