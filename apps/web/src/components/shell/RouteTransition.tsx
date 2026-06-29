'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Minimum time the branded loader stays up, so a nav press reads as a deliberate
// beat (logo + dots) rather than a flicker — even when the next screen is ready
// instantly. A safety timer guarantees it never gets stuck.
const MIN_VISIBLE_MS = 420
const SAFETY_MS = 6000

type Ctx = { navigate: (href: string) => void; pendingHref: string | null }

const RouteTransitionContext = createContext<Ctx>({ navigate: () => {}, pendingHref: null })

export const useRouteTransition = () => useContext(RouteTransitionContext)

// Wraps the dashboard shell so any nav item can show one consistent loading
// status while the next screen commits. Drives off the committed pathname, so
// it clears exactly when the destination is on screen.
export const RouteTransitionProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const startedAt = useRef(0)

  const navigate = useCallback((href: string) => {
    if (href === pathname) return
    startedAt.current = performance.now()
    setPendingHref(href)
    router.push(href)
  }, [pathname, router])

  useEffect(() => {
    if (!pendingHref) return
    const arrived = pathname === pendingHref
    const wait = arrived ? Math.max(0, MIN_VISIBLE_MS - (performance.now() - startedAt.current)) : SAFETY_MS
    const t = setTimeout(() => setPendingHref(null), wait)
    return () => clearTimeout(t)
  }, [pathname, pendingHref])

  return (
    <RouteTransitionContext.Provider value={{ navigate, pendingHref }}>
      {children}
    </RouteTransitionContext.Provider>
  )
}
