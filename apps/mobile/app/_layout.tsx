import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { getToken } from '@/lib/auth'

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()

  // Re-read SecureStore on every navigation so the check is always fresh.
  // The login screen navigates to /(tabs) after a successful login; this guard
  // only needs to protect against unauthenticated access (→ /login).
  useEffect(() => {
    if (!segments.length) return
    getToken().then((t: string | null) => {
      const inAuthScreen = segments[0] === 'login'
      if (!t && !inAuthScreen) router.replace('/login')
    })
  }, [segments])

  return (
    <>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="scan" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  )
}
