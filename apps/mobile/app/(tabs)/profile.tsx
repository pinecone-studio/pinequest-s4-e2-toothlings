import { ScrollView, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCallback, useState } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getUser, saveUser } from '@/lib/auth'
import { getMe, apiFetch, type MeResult, type TriageLevel } from '@/lib/api'
import { useTheme } from '@/lib/ThemeContext'
import { useFloatingTabBarPad } from '@/lib/tabBarLayout'
import SettingsSection from '@/components/profile/SettingsSection'
import RoleSwitchButton from '@/components/profile/RoleSwitchButton'
import EditProfileSheet, { realEmail } from '@/components/profile/EditProfileSheet'
import LastScreeningCard from '@/components/home/LastScreeningCard'
import { useSession } from '@/lib/SessionContext'
import { ROLE_LABEL } from '@/lib/roleConfig'

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
  const { activeRole, refresh } = useSession()
  const [me, setMe] = useState<MeResult | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [latest, setLatest] = useState<LatestScreening | null>(null)

  const loadMe = useCallback(() => {
    getMe()
      .then(setMe)
      .catch(async () => {
        const u = await getUser()
        if (u) setMe({ id: u.id, name: u.name, role: u.role, email: '', phone: null, schoolId: u.schoolId ?? null, isActive: true })
      })
  }, [])

  // Re-pull on every focus so a newly-enrolled child (which the server links on
  // /auth/me) flips hasParentLink → the role switcher appears without a re-login.
  useFocusEffect(useCallback(() => {
    void refresh()
    loadMe()
    apiFetch<LatestScreening[]>('/api/screenings')
      .then((rows) => setLatest(rows[0] ?? null))
      .catch(() => {})
  }, [refresh, loadMe]))

  const onSaved = async (updated: { name: string; email: string; phone: string | null }) => {
    setMe((prev) => (prev ? { ...prev, name: updated.name, email: updated.email, phone: updated.phone } : prev))
    const u = await getUser()
    if (u) await saveUser({ ...u, name: updated.name })
  }

  if (!me) {
    return <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}><ActivityIndicator color={colors.primary} style={s.loader} /></SafeAreaView>
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={s.header}>
        <Pressable
          style={({ pressed }) => [s.headerTap, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => setEditOpen(true)}
          hitSlop={8}
        >
          <View style={[s.avatar, { backgroundColor: colors.primary }]}><Text style={[s.avatarText, { color: colors.primaryText }]}>{me.name.charAt(0).toUpperCase()}</Text></View>
          <View style={s.nameRow}>
            <Text style={[s.name, { color: colors.textBase }]}>{me.name}</Text>
            <Ionicons name="create-outline" size={16} color={colors.textMuted} />
          </View>
        </Pressable>
        <View style={s.roleRow}>
          <Text style={[s.role, { color: colors.textMuted }]}>{ROLE_LABEL[activeRole ?? me.role] ?? me.role}</Text>
          <RoleSwitchButton />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: tabBarPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Row label="И-мэйл" value={realEmail(me.email) || '—'} muted={colors.textMuted} base={colors.textBase} />
          <Row label="Утас" value={me.phone || '—'} muted={colors.textMuted} base={colors.textBase} />
        </View>

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

      <EditProfileSheet
        visible={editOpen}
        initial={{ name: me.name, phone: me.phone, email: me.email }}
        onClose={() => setEditOpen(false)}
        onSaved={onSaved}
      />
    </SafeAreaView>
  )
}

const Row = ({ label, value, muted, base }: { label: string; value: string; muted: string; base: string }) => (
  <View style={s.row}>
    <Text style={[s.rowLabel, { color: muted }]}>{label}</Text>
    <Text style={[s.rowValue, { color: base }]} numberOfLines={1}>{value}</Text>
  </View>
)

const s = StyleSheet.create({
  root: { flex: 1 },
  loader: { marginTop: 48 },
  scroll: { padding: 20, gap: 18 },
  header: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  headerTap: { alignItems: 'center', gap: 6 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 30, fontFamily: 'Inter_700Bold' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  role: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  rowValue: { fontSize: 14, fontFamily: 'Inter_500Medium', flexShrink: 1 },
})

export default ProfileScreen
