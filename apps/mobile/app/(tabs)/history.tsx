import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

type Screening = { id: string; triageLevel: string; capturedAt: string; childKey: string }

const LEVEL_COLOR: Record<string, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
}
const LEVEL_LABEL: Record<string, string> = {
  green: 'Нормаль',
  yellow: 'Хянах',
  red: 'Яаралтай',
}

export default function HistoryScreen() {
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Screening[]>('/api/screenings')
      .then(setScreenings)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <SafeAreaView style={s.root}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    )

  if (error)
    return (
      <SafeAreaView style={s.root}>
        <Text style={s.errorText}>{error}</Text>
      </SafeAreaView>
    )

  return (
    <SafeAreaView style={s.root}>
      <Text style={s.header}>Скринингийн түүх</Text>
      <FlatList
        data={screenings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={<Text style={s.empty}>Скрининг байхгүй байна</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={[s.badge, { backgroundColor: LEVEL_COLOR[item.triageLevel] ?? '#94a3b8' }]}>
              <Text style={s.badgeText}>{LEVEL_LABEL[item.triageLevel] ?? item.triageLevel}</Text>
            </View>
            <Text style={s.date}>{new Date(item.capturedAt).toLocaleDateString('mn-MN')}</Text>
            <Text style={s.key} numberOfLines={1}>{item.childKey}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  header: { fontSize: 20, fontWeight: '700', color: '#1e293b', padding: 20, paddingBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 1,
  },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  date: { flex: 1, fontSize: 14, color: '#334155' },
  key: { fontSize: 12, color: '#94a3b8', maxWidth: 90 },
  errorText: { color: '#ef4444', padding: 24 },
  empty: { textAlign: 'center', color: '#94a3b8', paddingTop: 40 },
})
