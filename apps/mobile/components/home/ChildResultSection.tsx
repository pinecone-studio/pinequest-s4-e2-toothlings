import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'
import { getBoardStudents, type BoardStudent, type TriageLevel } from '@/lib/api'
import LastScreeningCard from './LastScreeningCard'

// SCREENING-not-diagnosis wording: green never claims "healthy" / "no cavities".
const TRIAGE_SUMMARY: Record<TriageLevel, string> = {
  green: 'Эдгээр зурагт аюулын шинж тэмдэг харагдсангүй',
  yellow: 'Анхаарал шаардлагатай — шүдний эмчид үзүүлэхийг зөвлөж байна',
  red: 'Яаралтай — аль болох хурдан шүдний эмчид хандана уу',
}

// Parent home: their own linked child's latest screening result (board/students
// is scope-limited to the child server-side — no class/cohort data leaks here).
const ChildResultSection = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const [child, setChild] = useState<BoardStudent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBoardStudents()
      .then((kids) => setChild(kids.find((k) => k.latestLevel) ?? kids[0] ?? null))
      .catch(() => setChild(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <View>
      <Text style={[s.title, { color: colors.textMuted }]}>Миний хүүхэд</Text>
      {loading ? (
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !child ? (
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.empty, { color: colors.textDisabled }]}>
            Холбогдсон хүүхэд алга. Бүртгэлдээ хүүхдийнхээ нэрийг холбоно уу.
          </Text>
        </View>
      ) : child.latestLevel ? (
        <LastScreeningCard
          date={child.screenedAt ? new Date(child.screenedAt).toLocaleDateString('mn-MN') : ''}
          triageLevel={child.latestLevel}
          summary={`${child.lastName} ${child.firstName} · ${TRIAGE_SUMMARY[child.latestLevel]}`}
          onPress={() => router.push('/(tabs)/history' as never)}
        />
      ) : (
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.name, { color: colors.textBase }]}>{child.lastName} {child.firstName}</Text>
          <Text style={[s.empty, { color: colors.textDisabled }]}>Одоогоор скрининг хийгдээгүй байна</Text>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.5, paddingBottom: 8 },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 6, alignItems: 'center' },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  empty: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
})

export default ChildResultSection
