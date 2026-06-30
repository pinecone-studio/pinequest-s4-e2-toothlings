import { Tabs, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/lib/ThemeContext'
import { useSession } from '@/lib/SessionContext'
import { roleConfigFor } from '@/lib/roleConfig'
import CameraTabButton from '@/components/home/CameraTabButton'
import GlassTabBarBackground from '@/components/home/GlassTabBarBackground'
import { TAB_BAR_RADIUS, TAB_BAR_HEIGHT, TAB_BAR_SIDE_INSET } from '@/lib/tabBarLayout'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

const TabIcon = ({ name, color }: { name: IoniconsName; color: string }) => (
  <Ionicons name={name} size={22} color={color} />
)

const TabLayout = () => {
  const { colors, dark } = useTheme()
  const router = useRouter()
  const { activeRole } = useSession()
  const config = roleConfigFor(activeRole)
  const insets = useSafeAreaInsets()

  const barFloat = (insets.bottom || 12) + 6 // gap between the bar and the screen bottom

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // No bottom reservation — screens render UNDER the floating bar so the
        // glass actually blurs the content behind it (see-through). Screens that
        // scroll pad their own content to keep the last item above the bar.
        sceneStyle: { backgroundColor: colors.bg },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        // Frosted-glass pane floating above the screen content.
        tabBarBackground: () => <GlassTabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          // NOTE: React Navigation's base tab-bar style sets `start:0/end:0`,
          // which override `left`/`right`. Use marginHorizontal to actually
          // shrink the bar's width.
          marginHorizontal: TAB_BAR_SIDE_INSET,
          bottom: barFloat,
          height: TAB_BAR_HEIGHT,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          borderRadius: TAB_BAR_RADIUS,
          // float shadow (lives on the unclipped outer container)
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: dark ? 0.4 : 0.15,
          shadowRadius: 20,
          elevation: 16,
        },
        tabBarItemStyle: { paddingVertical: 0 }, // center icon+label evenly (no top offset)
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
        options={
          config.tabs.camera
            ? {
                title: '',
                tabBarButton: (props) => (
                  <CameraTabButton {...props} onPress={() => router.push('/scan')} />
                ),
              }
            : { href: null }
        }
      />
      <Tabs.Screen
        name="hospital"
        options={{
          title: config.tabs.hospitalLabel,
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
      <Tabs.Screen name="classes" options={{ href: null }} />
      <Tabs.Screen name="calendar" options={{ href: null }} />
    </Tabs>
  )
}

export default TabLayout
