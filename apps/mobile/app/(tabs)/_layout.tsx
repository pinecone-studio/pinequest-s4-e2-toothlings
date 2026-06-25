import { Tabs, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import CameraTabButton from '@/components/home/CameraTabButton'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

const TabIcon = ({ name, color }: { name: IoniconsName; color: string }) => (
  <Ionicons name={name} size={22} color={color} />
)

const TabLayout = () => {
  const { colors } = useTheme()
  const router = useRouter()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Нүүр',
          tabBarIcon: ({ color }) => <TabIcon name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: 'Заавар',
          tabBarIcon: ({ color }) => <TabIcon name="book-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '',
          tabBarButton: () => (
            <CameraTabButton onPress={() => router.push('/scan')} />
          ),
        }}
      />
      <Tabs.Screen
        name="hospital"
        options={{
          title: 'Эмнэлэг',
          tabBarIcon: ({ color }) => <TabIcon name="medkit-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профайл',
          tabBarIcon: ({ color }) => <TabIcon name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  )
}

export default TabLayout
