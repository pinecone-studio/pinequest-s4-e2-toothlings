import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { getToken } from '@/lib/auth'
import { ThemeProvider } from '@/lib/ThemeContext'

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()

  // Re-read SecureStore on every navigation so the check is always fresh.
  useEffect(() => {
    if (!segments.length) return
    getToken().then((t: string | null) => {
      const inAuthScreen = segments[0] === 'login'
      if (!t && !inAuthScreen) router.replace('/login')
    })
  }, [segments])

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="scan" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}
