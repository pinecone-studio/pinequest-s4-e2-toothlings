import { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import { getChildSummary, type RosterStatusRow } from '@/lib/api'
import { openParentEmail } from '@/lib/parentEmail'
import TriageBadge from './TriageBadge'

// Flagged (red/yellow) students with their ID data + a per-child "email the parent"
// button (mailto deep link built from the hedged child summary).
const RedStudentsSection = ({ roster }: { roster: RosterStatusRow[] }) => {
  const { colors } = useTheme()
  const [sendingId, setSendingId] = useState<string | null>(null)
  const flagged = roster.filter((r) => r.latestLevel === 'red' || r.latestLevel === 'yellow')

  const send = async (r: RosterStatusRow) => {
    setSendingId(r.id)
    try {
      const payload = await getChildSummary(r.id)
      if (payload.summary) openParentEmail(`${r.lastName} ${r.firstName}`, r.guardianEmail, payload.summary)
    } catch {
      // deep-link best-effort; nothing to surface
    } finally {
      setSendingId(null)
    }
  }

  if (flagged.length === 0) return null

  return (
    <View style={s.wrap}>
      <Text style={[s.title, { color: colors.triageRedText }]}>Анхаарал шаардлагатай · {flagged.length}</Text>
      {flagged.map((r) => (
        <View key={r.id} style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.info}>
            <Text style={[s.name, { color: colors.textBase }]} numberOfLines={1}>{r.lastName} {r.firstName}</Text>
            <Text style={[s.meta, { color: colors.textMuted }]} numberOfLines={1}>№{r.rosterSlot} · {r.guardianEmail ?? 'и-мэйл бүртгэлгүй'}</Text>
          </View>
          <TriageBadge level={r.latestLevel} />
          <TouchableOpacity
            style={[s.mail, { backgroundColor: r.guardianEmail ? colors.primary : colors.surfaceRaised }]}
            onPress={() => { if (r.guardianEmail) void send(r) }}
            disabled={!r.guardianEmail || sendingId === r.id}
            activeOpacity={0.7}
          >
            {sendingId === r.id
              ? <ActivityIndicator size="small" color={colors.primaryText} />
              : <Ionicons name="mail-outline" size={16} color={r.guardianEmail ? colors.primaryText : colors.textDisabled} />}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { gap: 8 },
  title: { fontSize: 13, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingVertical: 10 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  meta: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  mail: { width: 36, height: 36, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
})

export default RedStudentsSection
