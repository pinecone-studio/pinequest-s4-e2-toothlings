import { Stack } from 'expo-router'

export default function ScanLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Хүүхдийн мэдээлэл', headerBackTitle: 'Буцах' }}
      />
      <Stack.Screen
        name="camera"
        options={{ title: 'Зураг авах', headerShown: false }}
      />
      <Stack.Screen
        name="result"
        options={{ title: 'Үр дүн', headerBackVisible: false }}
      />
    </Stack>
  )
}
