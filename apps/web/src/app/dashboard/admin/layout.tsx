'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from '@/components/providers'
import { SeasonProvider } from '@/components/SeasonProvider'
import AppShell from '@/components/shell/AppShell'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { token, role, ready } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (ready && (!token || role !== 'admin')) router.replace('/login')
  }, [ready, token, role, router])

  if (!ready || !token || role !== 'admin') return null

  return (
    <AppShell>
      <SeasonProvider>{children}</SeasonProvider>
    </AppShell>
  )
}

export default AdminLayout
