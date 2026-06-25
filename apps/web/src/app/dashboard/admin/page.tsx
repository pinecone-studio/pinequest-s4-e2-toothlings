'use client'

import { useScreenings } from '@/hooks/useScreenings'
import { useSeason } from '@/components/SeasonProvider'
import ProfileCard from '@/components/dashboard/ProfileCard'
import DentistReviewQueueCard from '@/components/dashboard/DentistReviewQueueCard'
import NextFollowUpsCard from '@/components/dashboard/NextFollowUpsCard'
import ScreeningBarChart from '@/components/dashboard/ScreeningBarChart'
import MonthlyOverviewCard from '@/components/dashboard/MonthlyOverviewCard'
import RecentScreeningsTable from '@/components/dashboard/RecentScreeningsTable'
import SeasonSelector from '@/components/dashboard/SeasonSelector'
import Disclaimer from '@/components/dashboard/Disclaimer'

const AdminDashboardPage = () => {
  const { seasonId } = useSeason()
  const { data: screenings } = useScreenings({ seasonId })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold tracking-tight text-text-base">Мэдээлэл</h1>
        <SeasonSelector />
      </div>

      {/* Top row — [left: profile + review queue + follow-ups] [center chart] [right gold KPI] */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_1fr_300px]">
        <div className="flex flex-col gap-5">
          <ProfileCard />
          <DentistReviewQueueCard />
          <NextFollowUpsCard />
        </div>

        <ScreeningBarChart />

        <MonthlyOverviewCard />
      </div>

      {/* Full-width prioritized worklist */}
      <RecentScreeningsTable screenings={screenings} />

      <Disclaimer />
    </div>
  )
}

export default AdminDashboardPage
