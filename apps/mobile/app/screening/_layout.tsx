import { Stack } from 'expo-router'

export default function ScreeningLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  )
}
