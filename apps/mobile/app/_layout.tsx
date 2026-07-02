import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { Text, TextInput } from 'react-native'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { ThemeProvider, useTheme } from '@/lib/ThemeContext'
import { SessionProvider } from '@/lib/SessionContext'

// Hold the native splash up while fonts load. The root layout must render the
// navigator (RootStack) on its FIRST render — never an early-return placeholder —
// or expo-router throws "Attempted to navigate before mounting the Root Layout".
// The auth/cold-start gate lives INSIDE the navigator (app/(tabs)/_layout) via a
// declarative <Redirect>, so no imperative navigation ever runs from here.
void SplashScreen.preventAutoHideAsync()

const applyInterDefaults = () => {
  const base = { fontFamily: 'Inter_400Regular' }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(Text as any).defaultProps = { ...((Text as any).defaultProps ?? {}), style: base }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(TextInput as any).defaultProps = { ...((TextInput as any).defaultProps ?? {}), style: base }
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Inter_400Regular: require('../assets/fonts/Inter_400Regular.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Inter_500Medium:  require('../assets/fonts/Inter_500Medium.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Inter_600SemiBold: require('../assets/fonts/Inter_600SemiBold.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Inter_700Bold:    require('../assets/fonts/Inter_700Bold.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      applyInterDefaults()
      void SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  // Always render the navigator (RootStack) on the first render — do NOT gate it on
  // fontsLoaded; the splash stays up until fonts are ready (hidden in the effect above).
  return (
    <ThemeProvider>
      <SessionProvider>
        <RootStack />
      </SessionProvider>
      <ThemedStatusBar />
    </ThemeProvider>
  )
}

const ThemedStatusBar = () => {
  const { dark } = useTheme()
  return <StatusBar style={dark ? 'light' : 'dark'} />
}

const RootStack = () => {
  const { colors } = useTheme()
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.bg },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.textBase,
        headerTitleStyle: { color: colors.textBase },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ headerShown: false }} />
      <Stack.Screen name="hospital" options={{ headerShown: false }} />
      <Stack.Screen name="stats" options={{ headerShown: false }} />
      <Stack.Screen name="classes" options={{ headerShown: false }} />
      <Stack.Screen name="calendar" options={{ headerShown: false }} />
      <Stack.Screen name="history" options={{ headerShown: false }} />
      <Stack.Screen name="class" options={{ headerShown: false }} />
      <Stack.Screen name="screening" options={{ headerShown: false }} />
    </Stack>
  )
}
