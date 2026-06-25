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
      <h1 className="text-2xl font-semibold tracking-tight">Тавтай морил, скрининг хийгч</h1>
      <p className="text-text-muted">
        Та (багш, сургууль/цэцэрлэгийн эмч гэх мэт шүдний бус ажилтан) хүүхдийн шүдийг гар утасны
        аппаар скрининг хийнэ. Энэ нь онош биш — хүүхдийг эмчид хурдан чиглүүлэх зорилготой. Энэ вэб
        нь бүртгэл, удирдлагад зориулагдсан.
      </p>
      <button
        onClick={logout}
        className="self-start text-sm text-text-muted hover:text-text-base"
      >
        Гарах
      </button>
    </main>
  )
}

export default ScreenerHomePage
