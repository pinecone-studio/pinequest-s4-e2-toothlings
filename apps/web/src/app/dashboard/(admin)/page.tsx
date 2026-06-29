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

      {/* First screen — overview grid + disclaimer, together capped to the viewport
          height so the disclaimer always stays visible. The grid flexes to fill;
          tall columns scroll within themselves. The worklist below scrolls in main. */}
      <div className="flex flex-col gap-5 xl:h-[calc(100dvh-8rem)] xl:min-h-0">
        {/* [left: profile + review queue] [center chart] [right: calendar + next schedule] */}
        <div className="grid grid-cols-1 gap-5 xl:min-h-0 xl:flex-1 xl:grid-cols-[280px_1fr_300px]">
          <div className="flex flex-col gap-5 xl:min-h-0 xl:overflow-y-auto">
            <ProfileCard />
            <DentistReviewQueueCard />
          </div>

          <ScreeningBarChart />

          <div className="flex flex-col gap-5 xl:min-h-0">
            <ScheduleCalendar className="xl:shrink-0 xl:grow-0" />
            <NextFollowUpsCard />
          </div>
        </div>

        <Disclaimer />
      </div>

      {/* Full-width prioritized worklist */}
      <RecentScreeningsTable screenings={screenings} loading={screeningsLoading} />
    </div>
  )
}

export default AdminDashboardPage
