import { useEffect, useState } from 'react'
import { Tabs, useRouter, Redirect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/lib/ThemeContext'
import { useSession } from '@/lib/SessionContext'
import { useModelPrefetch } from '@/lib/useModelPrefetch'
import { roleConfigFor } from '@/lib/roleConfig'
import { getToken } from '@/lib/auth'
import HeroIcon from '@/components/ui/HeroIcon'
import CameraTabButton from '@/components/home/CameraTabButton'
import GlassTabBarBackground from '@/components/home/GlassTabBarBackground'
import { TAB_BAR_RADIUS, TAB_BAR_HEIGHT, TAB_BAR_SIDE_INSET } from '@/lib/tabBarLayout'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

const TabIcon = ({ name, color }: { name: IoniconsName; color: string }) => (
  <Ionicons name={name} size={22} color={color} />
)

// 'checking' until we've read the stored token; then either bounce to /login or
// render the tabs. Auto-resume when a session token exists — this is what makes
// offline-first work: a screener who logged in once (online) re-opens the app with
// NO signal and lands straight in the tabs (the model is already cached), never
// hitting the login screen. Only a truly signed-out phone (no token) sees /login.
// The gate lives INSIDE the navigator so we can redirect declaratively with
// <Redirect>, which avoids the "navigate before mounting the Root Layout" crash.
type Gate = 'checking' | 'login' | 'ok'

const TabLayout = () => {
  const { colors, dark } = useTheme()
  const router = useRouter()
  const { activeRole } = useSession()
  const config = roleConfigFor(activeRole)
  const insets = useSafeAreaInsets()

  const [gate, setGate] = useState<Gate>('checking')
  useEffect(() => {
    void getToken().then((t) => setGate(t ? 'ok' : 'login'))
  }, [])

  // Warm the on-device model into cache the moment a signed-in user is in the app,
  // so a first scan can still run if they later lose signal (no-signal soum).
  useModelPrefetch()

  if (gate === 'checking') return null
  if (gate === 'login') return <Redirect href="/login" />

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
          title: 'Шүд угаалт',
          tabBarIcon: ({ color }) => <HeroIcon name="toothbrush" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan-tab"
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
          title: 'Тохиргоо',
          tabBarIcon: ({ color }) => <TabIcon name="settings-outline" color={color} />,
        }}
      />
    </Tabs>
  )
}

export default TabLayout
