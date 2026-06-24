'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from '@/components/providers'

const ScreenerHomePage = () => {
  const { token, ready, logout } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (ready && !token) router.replace('/login')
  }, [ready, token, router])

  if (!ready || !token) return null

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Тавтай морил, шинжээч</h1>
      <p className="text-neutral-600">
        Скрининг авах ажиллагаа гар утасны аппликейшнээр хийгдэнэ. Энэ вэб нь бүртгэл болон
        удирдлагад зориулагдсан.
      </p>
      <button
        onClick={logout}
        className="self-start text-sm text-neutral-500 hover:text-neutral-900"
      >
        Гарах
      </button>
    </main>
  )
}

export default ScreenerHomePage
