'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from '@/components/providers'
import AppShell from '@/components/shell/AppShell'

const DentistLayout = ({ children }: LayoutProps<'/dentist'>) => {
  const { token, role, ready } = useSession()
  const router = useRouter()
  const allowed = role === 'dentist' || role === 'admin'

  useEffect(() => {
    if (ready && (!token || !allowed)) router.replace('/login')
  }, [ready, token, allowed, router])

  if (!ready || !token || !allowed) return null

  return <AppShell>{children}</AppShell>
}

export default DentistLayout
