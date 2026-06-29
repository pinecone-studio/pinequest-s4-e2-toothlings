import type { UserRole } from '@pinequest/types'

const TOKEN_KEY = 'toothlings_token'

export const setToken = (token: string): void => {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; secure' : ''
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=43200; samesite=strict${secure}`
}

export const getToken = (): string | null => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`${TOKEN_KEY}=([^;]+)`))
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

export const clearToken = (): void => {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
}

type JwtPayload = { sub: string; role: UserRole; schoolId?: string; exp?: number }

/** Landing route for a role after login/registration. */
export const homeForRole = (role: UserRole | string | null): string => {
  if (role === 'parent') return '/dashboard/child'
  if (role === 'dentist') return '/dashboard/dentist/help'
  if (role === 'follow_up') return '/dashboard/follow-up'
  return '/dashboard'
}

/** Decode the (unverified) JWT payload for client-side UX gating only.
 *  The API re-verifies every request — this is not a security boundary. */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return JSON.parse(atob(token.split('.')[1])) as JwtPayload
  } catch {
    return null
  }
}
