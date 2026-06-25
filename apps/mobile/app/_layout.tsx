import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { Text, TextInput, View } from 'react-native'
import { useFonts } from 'expo-font'
import { getToken } from '@/lib/auth'
import { ThemeProvider } from '@/lib/ThemeContext'

const applyInterDefaults = () => {
  const base = { fontFamily: 'Inter_400Regular' }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(Text as any).defaultProps = { ...((Text as any).defaultProps ?? {}), style: base }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(TextInput as any).defaultProps = { ...((TextInput as any).defaultProps ?? {}), style: base }
}

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()

  const [fontsLoaded] = useFonts({
    Inter_400Regular: require('../assets/fonts/Inter_400Regular.ttf'),
    Inter_500Medium:  require('../assets/fonts/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('../assets/fonts/Inter_600SemiBold.ttf'),
    Inter_700Bold:    require('../assets/fonts/Inter_700Bold.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) applyInterDefaults()
  }, [fontsLoaded])

  useEffect(() => {
    if (!segments.length) return
    getToken().then((t: string | null) => {
      const inAuthScreen = segments[0] === 'login'
      if (!t && !inAuthScreen) router.replace('/login')
    })
  }, [segments])

  if (!fontsLoaded) return <View style={{ flex: 1 }} />

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
