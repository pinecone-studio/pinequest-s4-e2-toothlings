import { useCallback, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import { getHelpRequests, connectHelpRequest, type HelpRequestRow } from '@/lib/api'

const STATUS_LABEL: Record<HelpRequestRow['status'], string> = {
  open: 'Шинэ',
  connected: 'Холбогдсон',
  closed: 'Хаагдсан',
}

type Props = {
  /** Cap the list (home card). Omit for the full tab view. */
  limit?: number
  onSeeMore?: () => void
}

// Dentist worklist: incoming volunteer help requests (server scopes a dentist to
// open + already-assigned requests). A dentist can claim an open request.
const HelpRequestsSection = ({ limit, onSeeMore }: Props) => {
  const { colors } = useTheme()
  const [rows, setRows] = useState<HelpRequestRow[] | null>(null)
  const [connectingId, setConnectingId] = useState<string | null>(null)

  const load = useCallback(() => {
    getHelpRequests()
      .then(setRows)
      .catch(() => setRows([]))
  }, [])

  useEffect(() => { load() }, [load])

  const connect = async (id: string) => {
    setConnectingId(id)
    try {
      await connectHelpRequest(id)
      load()
    } catch {
      // best-effort; row stays open on failure
    } finally {
      setConnectingId(null)
    }
  }

  if (rows === null) {
    return <ActivityIndicator color={colors.primary} style={s.loader} />
  }

  const shown = limit ? rows.slice(0, limit) : rows
  const dotColor = (level: HelpRequestRow['level']) => (level === 'red' ? colors.badgeRed : colors.badgeYellow)

  return (
    <View style={s.wrap}>
      <Text style={[s.title, { color: colors.textMuted }]}>Тусламжийн хүсэлт · {rows.length}</Text>
      {shown.length === 0 ? (
        <View style={[s.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.emptyText, { color: colors.textDisabled }]}>Одоогоор хүсэлт алга</Text>
        </View>
      ) : (
        shown.map((r) => (
          <View key={r.id} style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[s.dot, { backgroundColor: dotColor(r.level) }]} />
            <View style={s.info}>
              <Text style={[s.name, { color: colors.textBase }]} numberOfLines={1}>
                {r.child ? `${r.child.lastName} ${r.child.firstName}` : 'Хүүхэд'}
              </Text>
              <Text style={[s.meta, { color: colors.textMuted }]} numberOfLines={1}>
                {STATUS_LABEL[r.status]}
                {r.child?.guardianPhone ? ` · ${r.child.guardianPhone}` : ''}
              </Text>
            </View>
            {r.status === 'open' ? (
              <TouchableOpacity
                style={[s.connect, { backgroundColor: colors.primary }]}
                onPress={() => void connect(r.id)}
                disabled={connectingId === r.id}
                activeOpacity={0.7}
              >
                {connectingId === r.id
                  ? <ActivityIndicator size="small" color={colors.primaryText} />
                  : <Text style={[s.connectText, { color: colors.primaryText }]}>Холбогдох</Text>}
              </TouchableOpacity>
            ) : (
              <Ionicons name="checkmark-circle" size={22} color={colors.badgeGreen} />
            )}
          </View>
        ))
      )}
      {limit && rows.length > limit && onSeeMore ? (
        <TouchableOpacity onPress={onSeeMore} activeOpacity={0.7} style={s.more}>
          <Text style={[s.moreText, { color: colors.primary }]}>Бүгдийг харах</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { gap: 8 },
  loader: { paddingVertical: 28 },
  title: { fontSize: 13, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3 },
  empty: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 16, alignItems: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingVertical: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  meta: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  connect: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999 },
  connectText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  more: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 6 },
  moreText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
})

export default HelpRequestsSection
