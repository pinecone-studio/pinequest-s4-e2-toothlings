import { Stack } from 'expo-router'

export default function ScanLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Шалгуулагчийн мэдээлэл', headerBackTitle: 'Буцах' }}
      />
      <Stack.Screen
        name="consent"
        options={{ title: 'Зөвшөөрөл', headerBackTitle: 'Буцах' }}
      />
      <Stack.Screen
        name="questionnaire"
        options={{ title: 'Асуумж', headerBackTitle: 'Буцах' }}
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
