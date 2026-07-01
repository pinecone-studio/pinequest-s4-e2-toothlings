import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCallback, useState } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import { apiFetch, type TriageLevel } from '@/lib/api'
import { useTheme } from '@/lib/ThemeContext'
import { useFloatingTabBarPad } from '@/lib/tabBarLayout'
import { useSession } from '@/lib/SessionContext'
import SettingsSection from '@/components/profile/SettingsSection'
import ProfileCard from '@/components/profile/ProfileCard'
import LastScreeningCard from '@/components/home/LastScreeningCard'

// SCREENING-not-diagnosis wording: green never says "healthy", no clinical words.
const TRIAGE_SUMMARY: Record<TriageLevel, string> = {
  green: 'Эдгээр зурагт аюулын шинж тэмдэг харагдсангүй',
  yellow: 'Анхаарал шаардлагатай - шүдний эмчид үзүүлэхийг зөвлөж байна',
  red: 'Яаралтай - аль болах хурдан шүдний эмчид хандана уу',
}

type LatestScreening = {
  id: string
  triageLevel: TriageLevel
  capturedAt: string
  review?: { confirmedLevel: TriageLevel | null } | null
}

const ProfileScreen = () => {
  const { colors } = useTheme()
  const tabBarPad = useFloatingTabBarPad()
  const router = useRouter()
  const { refresh } = useSession()
  const [latest, setLatest] = useState<LatestScreening | null>(null)

  // Re-pull on every focus so a newly-enrolled child (which the server links on
  // /auth/me) flips hasParentLink → the role switcher appears without a re-login.
  useFocusEffect(useCallback(() => {
    void refresh()
    apiFetch<LatestScreening[]>('/api/screenings')
      .then((rows) => setLatest(rows[0] ?? null))
      .catch(() => {})
  }, [refresh]))

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: colors.textBase }]}>Тохиргоо</Text>
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: tabBarPad }]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard />

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
        <SettingsSection />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, gap: 18 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  headerTitle: { fontSize: 24, fontFamily: 'Inter_700Bold' },
})

export default ProfileScreen
