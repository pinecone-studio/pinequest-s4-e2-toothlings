import type { UserRole } from '@pinequest/types'

const TOKEN_KEY = 'screener_token'

export const setToken = (token: string): void => {
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=43200; samesite=lax`
}

export const getToken = (): string | null => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`${TOKEN_KEY}=([^;]+)`))
  return match ? match[1] : null
}

export const clearToken = (): void => {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
}

type JwtPayload = { sub: string; role: UserRole; schoolId?: string; exp?: number }

/** Landing route for a role after login/registration. */
export const homeForRole = (role: UserRole | string | null): string => {
  if (role === 'admin') return '/admin'
  if (role === 'dentist') return '/dentist'
  if (role === 'follow_up') return '/follow-up'
  return '/screener'
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
