'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/providers'
import { homeForRole } from '@/lib/auth'
import { ROUTES } from '@/lib/routes'

const STAFF_ROLES = new Set(['admin', 'dentist', 'follow_up'])

/** Auth guard for consumer flow pages (/home, /scan, …). */
export const ConsumerGuard = ({ children }: { children: React.ReactNode }) => {
  const { token, role, ready } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    if (!token) {
      router.replace(ROUTES.login)
      return
    }
    if (role && STAFF_ROLES.has(role)) {
      router.replace(homeForRole(role))
    }
  }, [ready, token, role, router])

  if (!ready || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-text-muted">
        Ачааллаж байна…
      </div>
    )
  }

  return <>{children}</>
}
