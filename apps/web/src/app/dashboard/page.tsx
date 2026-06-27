'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from '@/components/providers'
import { homeForRole } from '@/lib/auth'

// /dashboard has no board of its own — send the user to their role's board
// (admin → /dashboard/admin), or to login if not authenticated.
const DashboardIndex = () => {
  const router = useRouter()
  const { token, role, ready } = useSession()

  useEffect(() => {
    if (!ready) return
    router.replace(token ? homeForRole(role) : '/?auth=1')
  }, [ready, token, role, router])

  return null
}

export default DashboardIndex
