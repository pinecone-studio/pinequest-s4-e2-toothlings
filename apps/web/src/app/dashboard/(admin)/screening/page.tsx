'use client'

import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'
import { CariesDetectorDashboard } from '@/components/consumer/CariesDetectorDashboard'

const ScreeningPage = () => {
  useSetPageHeader({
    title: 'Амны хөндийн байдлын хяналт, үнэлгээ',
    subtitle: 'Оруулсан зургийг танин, дүгнэлт хийнэ.',
  })

  return <CariesDetectorDashboard />
}

export default ScreeningPage
