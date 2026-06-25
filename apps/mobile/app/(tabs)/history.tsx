import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { useTheme } from '@/lib/ThemeContext'
import { toMongolian } from '@/lib/errorMessages'

type Screening = { id: string; triageLevel: string; capturedAt: string; childKey: string }

const LEVEL_LABEL: Record<string, string> = {
  green: 'Нормаль',
  yellow: 'Хянах',
  red: 'Яаралтай',
}

export default function HistoryScreen() {
  const { colors } = useTheme()
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Screening[]>('/api/screenings')
      .then(setScreenings)
      .catch((e: unknown) => setError(toMongolian(e)))
      .finally(() => setLoading(false))
  }, [])

  const badgeColor = (level: string) =>
    level === 'green' ? colors.badgeGreen : level === 'red' ? colors.badgeRed : colors.badgeYellow

  if (loading) return <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}><ActivityIndicator style={{ flex: 1 }} /></SafeAreaView>
  if (error) return <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}><Text style={{ color: '#ef4444', padding: 24 }}>{error}</Text></SafeAreaView>

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <Text style={[s.header, { color: colors.textBase }]}>Скринингийн түүх</Text>
      <FlatList
        data={screenings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={<Text style={[s.empty, { color: colors.textDisabled }]}>Скрининг байхгүй байна</Text>}
        renderItem={({ item }) => (
          <View style={[s.card, { backgroundColor: colors.surface }]}>
            <View style={[s.badge, { backgroundColor: badgeColor(item.triageLevel) }]}>
              <Text style={s.badgeText}>{LEVEL_LABEL[item.triageLevel] ?? item.triageLevel}</Text>
            </View>
            <Text style={[s.date, { color: colors.textSecondary }]}>{new Date(item.capturedAt).toLocaleDateString('mn-MN')}</Text>
            <Text style={[s.key, { color: colors.textDisabled }]} numberOfLines={1}>{item.childKey}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { fontSize: 20, fontWeight: '700', padding: 20, paddingBottom: 8 },
  card: { borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 1 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  date: { flex: 1, fontSize: 14 },
  key: { fontSize: 12, maxWidth: 90 },
  empty: { textAlign: 'center', paddingTop: 40 },
})
