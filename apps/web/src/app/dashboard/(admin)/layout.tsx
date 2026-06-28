'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { UserRole } from '@pinequest/types'
import { useSession } from '@/components/providers'
import AppShell from '@/components/shell/AppShell'

// The board shell is shared by every role-scoped viewer; scope is enforced server-side.
const BOARD_ROLES: UserRole[] = ['admin', 'school_doctor', 'teacher', 'parent', 'screener']

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { token, role, ready } = useSession()
  const router = useRouter()
  const allowed = !!role && BOARD_ROLES.includes(role)

  useEffect(() => {
    if (ready && (!token || !allowed)) router.replace('/?auth=1')
  }, [ready, token, allowed, router])

  if (!ready || !token || !allowed) return null

  return <AppShell>{children}</AppShell>
}

export default AdminLayout
