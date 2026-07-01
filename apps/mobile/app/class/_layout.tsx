import { Stack } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'

const ClassLayout = () => {
  const { colors } = useTheme()
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.textBase,
        headerTitleStyle: { color: colors.textBase },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen name="new" options={{ title: 'Шинэ анги', headerBackTitle: 'Буцах' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  )
}

export default ClassLayout
