'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from '@/components/providers'

const FollowUpLayout = ({ children }: LayoutProps<'/follow-up'>) => {
  const { token, role, ready, logout } = useSession()
  const router = useRouter()
  const allowed = role === 'follow_up' || role === 'admin'

  useEffect(() => {
    if (ready && (!token || !allowed)) router.replace('/login')
  }, [ready, token, allowed, router])

  if (!ready || !token || !allowed) return null

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-3">
        <span className="font-semibold">Screener — Дагах</span>
        <button onClick={logout} className="text-sm text-neutral-500 hover:text-neutral-900">
          Гарах
        </button>
      </header>
      <div className="p-6">{children}</div>
    </div>
  )
}

export default FollowUpLayout
