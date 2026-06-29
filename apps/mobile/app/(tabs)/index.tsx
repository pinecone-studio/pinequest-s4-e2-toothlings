import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { getUser, type AuthUser } from '@/lib/auth'
import { useOutboxSync } from '@/lib/useOutboxSync'
import GreetingHeader from '@/components/home/GreetingHeader'

import ScanHeroCard from '@/components/home/ScanHeroCard'
import HistorySection from '@/components/profile/HistorySection'
import QuickActionGrid from '@/components/home/QuickActionGrid'

const QUICK_ACTIONS = [
  { id: 'classes',  icon: 'school-outline' as const,      label: 'Анги' },
  { id: 'stats',    icon: 'stats-chart-outline' as const, label: 'Статистик' },
  { id: 'calendar', icon: 'calendar-outline' as const,    label: 'Хуанли' },
  { id: 'history',  icon: 'list-outline' as const,        label: 'Түүх' },
]

const HomeScreen = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const { sync, syncing, pendingCount, deadCount } = useOutboxSync()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => { getUser().then(setUser) }, [])

  useFocusEffect(useCallback(() => {
    void sync()
  }, [sync]))

  const handleScan = () => router.push('/scan')

  const actions = QUICK_ACTIONS.map((a) => ({
    ...a,
    onPress: () => {
      if (a.id === 'classes') router.push('/(tabs)/classes' as never)
      else if (a.id === 'stats') router.push('/stats' as never)
      else if (a.id === 'calendar') router.push('/(tabs)/calendar' as never)
      else if (a.id === 'history') router.push('/(tabs)/history' as never)
    },
  }))

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]}>
      <View style={s.scroll}>
        <GreetingHeader
          name={user?.name ?? '...'}
          onPressAvatar={() => router.push('/(tabs)/profile' as never)}
          syncing={syncing}
          pendingCount={pendingCount}
          deadCount={deadCount}
        />
        <ScanHeroCard onScan={handleScan} />
        {user && <HistorySection userId={user.id} role={user.role} />}
        <QuickActionGrid actions={actions} />
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1, padding: 20, gap: 18, paddingBottom: 20 },
})

export default HomeScreen
