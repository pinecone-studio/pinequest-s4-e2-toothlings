import { useState } from 'react'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { getToken, saveToken, saveUser, saveOfflineCredential, verifyOfflineCredential, type AuthUser } from '@/lib/auth'
import { useSession } from '@/lib/SessionContext'
import { toMongolian } from '@/lib/errorMessages'

type AuthData = { token: string; user: AuthUser }

const LOGIN_PATH = '/api/auth/login'

// A dropped request (offline) surfaces as a fetch TypeError, unlike a 401/500
// which comes back as a normal Error(message). Only the former should trigger the
// offline-login fallback — a real "wrong password" must still be shown as-is.
const isNetworkError = (err: unknown): boolean =>
  err instanceof TypeError && /Network request failed|fetch/i.test(err.message)

export const useAuth = () => {
  const router = useRouter()
  const { refresh } = useSession()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enter = async () => {
    // Pull the role (incl. activeRole + parent-link) into the session before
    // landing on the role-aware tabs so the right UI renders immediately.
    await refresh()
    router.replace('/(tabs)')
  }

  const submit = async (path: string, body: Record<string, unknown>) => {
    setBusy(true)
    setError(null)
    try {
      const data = await apiFetch<AuthData>(path, { method: 'POST', body: JSON.stringify(body) })
      await saveToken(data.token)
      await saveUser(data.user)
      // Remember these credentials so the same user can re-enter this device offline.
      if (path === LOGIN_PATH) await saveOfflineCredential(String(body.email), String(body.password))
      await enter()
    } catch (err) {
      // Offline login: no signal to reach the server, but if these credentials
      // match the last successful online login AND a cached session exists, let
      // the screener back in (the capture loop runs fully on-device).
      if (path === LOGIN_PATH && isNetworkError(err)) {
        const ok = await verifyOfflineCredential(String(body.email), String(body.password))
        const token = await getToken()
        if (ok && token) {
          await enter()
          return
        }
        setError('Интернэт алга байна. Офлайн орохын тулд өмнө нэг удаа онлайнаар нэвтэрсэн бүртгэлээ ашиглана уу.')
        setBusy(false)
        return
      }
      setError(toMongolian(err))
      setBusy(false)
    }
  }

  return { submit, busy, error }
}
