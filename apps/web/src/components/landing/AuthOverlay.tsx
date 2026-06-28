'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, Suspense } from 'react'
import AuthModal from '@/components/auth/AuthModal'

const AuthOverlayInner = () => {
  const router = useRouter()
  const params = useSearchParams()
  const mode = params.get('auth')
  const open = mode === 'login' || mode === 'register'

  const onClose = useCallback(() => {
    router.replace('/', { scroll: false })
  }, [router])

  return (
    <AuthModal
      open={open}
      onClose={onClose}
      initialMode={mode === 'register' ? 'register' : 'login'}
    />
  )
}

// useSearchParams requires a Suspense boundary in Next.js 14+
export const AuthOverlay = () => (
  <Suspense>
    <AuthOverlayInner />
  </Suspense>
)
