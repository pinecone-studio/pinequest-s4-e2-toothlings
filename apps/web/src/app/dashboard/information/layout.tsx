'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from '@/components/providers'
import AppShell from '@/components/shell/AppShell'

const ALLOWED_ROLES = ['admin', 'school_doctor', 'teacher', 'screener']

const InformationLayout = ({ children }: { children: React.ReactNode }) => {
  const { token, role, ready } = useSession()
  const router = useRouter()
  const allowed = ALLOWED_ROLES.includes(role ?? '')

  useEffect(() => {
    if (ready && (!token || !allowed)) router.replace('/?auth=1')
  }, [ready, token, allowed, router])

  if (!ready || !token || !allowed) return null

  return <AppShell>{children}</AppShell>
}

export default InformationLayout
