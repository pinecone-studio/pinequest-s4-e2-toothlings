import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { getUser, type AuthUser } from '@/lib/auth'
import { useOutboxSync } from '@/lib/useOutboxSync'
import { apiFetch, type TriageLevel } from '@/lib/api'
import GreetingHeader from '@/components/home/GreetingHeader'

import ScanHeroCard from '@/components/home/ScanHeroCard'
import LastScreeningCard from '@/components/home/LastScreeningCard'
import QuickActionGrid from '@/components/home/QuickActionGrid'

const QUICK_ACTIONS = [
  { id: 'classes',  icon: 'school-outline' as const,      label: 'Анги' },
  { id: 'stats',    icon: 'stats-chart-outline' as const, label: 'Статистик' },
  { id: 'calendar', icon: 'calendar-outline' as const,    label: 'Хуанли' },
  { id: 'history',  icon: 'list-outline' as const,        label: 'Түүх' },
]

// SCREENING-not-diagnosis wording: green never says "healthy", no clinical words.
const TRIAGE_SUMMARY: Record<TriageLevel, string> = {
  green: 'Эдгээр зурагт аюулын шинж тэмдэг харагдсангүй',
  yellow: 'Анхаарал шаардлагатай — шүдний эмчид үзүүлэхийг зөвлөж байна',
  red: 'Яаралтай — аль болох хурдан шүдний эмчид хандана уу',
}

type LatestScreening = {
  id: string
  triageLevel: TriageLevel
  capturedAt: string
  review?: { confirmedLevel: TriageLevel | null } | null
}

const HomeScreen = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const { sync, syncing, pendingCount, deadCount } = useOutboxSync()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [latest, setLatest] = useState<LatestScreening | null>(null)

  useEffect(() => { getUser().then(setUser) }, [])

  const loadLatest = useCallback(() => {
    apiFetch<LatestScreening[]>('/api/screenings')
      .then((rows) => setLatest(rows[0] ?? null))
      .catch(() => {})
  }, [])

  useFocusEffect(useCallback(() => {
    void sync()
    loadLatest()
  }, [sync, loadLatest]))

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
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <GreetingHeader
          name={user?.name ?? '...'}
          onPressAvatar={() => router.push('/(tabs)/profile' as never)}
          syncing={syncing}
          pendingCount={pendingCount}
          deadCount={deadCount}
        />
        <ScanHeroCard onScan={handleScan} />
        {latest && (() => {
          const level = latest.review?.confirmedLevel ?? latest.triageLevel
          return (
            <LastScreeningCard
              date={new Date(latest.capturedAt).toLocaleDateString('mn-MN')}
              triageLevel={level}
              summary={TRIAGE_SUMMARY[level]}
              onPress={() => router.push('/(tabs)/history' as never)}
            />
          )
        })()}
        <QuickActionGrid actions={actions} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 18, paddingBottom: 32 },
})

export default HomeScreen
