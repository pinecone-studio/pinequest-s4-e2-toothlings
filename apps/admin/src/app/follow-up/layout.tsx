'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from '@/components/providers'
import AppShell from '@/components/shell/AppShell'

const FollowUpLayout = ({ children }: LayoutProps<'/follow-up'>) => {
  const { token, role, ready } = useSession()
  const router = useRouter()
  const allowed = role === 'follow_up' || role === 'admin'

  useEffect(() => {
    if (ready && (!token || !allowed)) router.replace('/login')
  }, [ready, token, allowed, router])

  if (!ready || !token || !allowed) return null

  return <AppShell>{children}</AppShell>
}

export default FollowUpLayout
