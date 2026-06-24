import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { getToken } from '@/lib/auth'

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    getToken().then((t: string | null) => {
      setAuthed(!!t)
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready) return
    const inAuthScreen = segments[0] === 'login'
    if (!authed && !inAuthScreen) router.replace('/login')
    else if (authed && inAuthScreen) router.replace('/(tabs)')
  }, [ready, authed, segments])

  if (!ready) return null

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
