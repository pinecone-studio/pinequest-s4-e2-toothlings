import { Stack } from 'expo-router'

const ClassLayout = () => (
  <Stack>
    <Stack.Screen name="new" options={{ title: 'Анги нэмэх', headerBackTitle: 'Буцах' }} />
    <Stack.Screen name="[id]" options={{ headerShown: false }} />
  </Stack>
)

export default ClassLayout
