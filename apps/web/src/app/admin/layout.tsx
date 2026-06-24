'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from '@/components/providers'

// Client-side UX gate: the API re-verifies every request, so this only steers
// the screener to the right place — it is not the security boundary.
const AdminLayout = ({ children }: LayoutProps<'/admin'>) => {
  const { token, role, ready, logout } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (ready && (!token || role !== 'admin')) router.replace('/login')
  }, [ready, token, role, router])

  if (!ready || !token || role !== 'admin') return null

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-3">
        <span className="font-semibold">Screener — Админ</span>
        <button onClick={logout} className="text-sm text-neutral-500 hover:text-neutral-900">
          Гарах
        </button>
      </header>
      <div className="p-6">{children}</div>
    </div>
  )
}

export default AdminLayout
