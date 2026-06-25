'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from '@/components/providers'
import AppShell from '@/components/shell/AppShell'

const AdminLayout = ({ children }: LayoutProps<'/admin'>) => {
  const { token, role, ready } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (ready && (!token || role !== 'admin')) router.replace('/login')
  }, [ready, token, role, router])

  if (!ready || !token || role !== 'admin') return null

  return <AppShell>{children}</AppShell>
}

export default AdminLayout
