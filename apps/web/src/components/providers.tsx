'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { UserRole } from '@pinequest/types'
import { clearToken, decodeToken, getToken } from '@/lib/auth'

type Session = {
  token: string | null
  role: UserRole | null
  ready: boolean
  logout: () => void
  refresh: () => void
}

const SessionContext = createContext<Session | null>(null)

export const useSession = (): Session => {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within <Providers>')
  return ctx
}

const queryClient = new QueryClient()

export const Providers = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setTokenState(getToken())
    setReady(true)
  }, [])

  const role = token ? (decodeToken(token)?.role ?? null) : null

  const value = useMemo<Session>(
    () => ({
      token,
      role,
      ready,
      logout: () => {
        clearToken()
        setTokenState(null)
      },
      refresh: () => setTokenState(getToken()),
    }),
    [token, role, ready],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
    </QueryClientProvider>
  )
}
