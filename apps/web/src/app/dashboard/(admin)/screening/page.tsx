'use client'

import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'
import { CariesDetectorDashboard } from '@/components/consumer/CariesDetectorDashboard'

const ScreeningPage = () => {
  useSetPageHeader({
    title: 'Шүдний шалгалт',
    subtitle: 'Зураг оруулаад AI шинжилгээ авч тархилалыг харна уу',
  })

  return <CariesDetectorDashboard />
}

export default ScreeningPage
