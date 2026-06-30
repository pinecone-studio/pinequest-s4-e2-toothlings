import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { getStats, type Stats } from '@/lib/api'

// School doctor home: school-wide screening overview (scope-limited server-side).
const SchoolOverviewSection = () => {
  const { colors } = useTheme()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <View>
      <Text style={[s.title, { color: colors.textMuted }]}>Сургуулийн тойм</Text>
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={s.loader} />
        ) : !stats ? (
          <Text style={[s.empty, { color: colors.textDisabled }]}>Мэдээлэл алга</Text>
        ) : (
          <>
            <View style={s.topRow}>
              <View>
                <Text style={[s.bigNum, { color: colors.textBase }]}>{stats.totalScreened}</Text>
                <Text style={[s.bigLabel, { color: colors.textMuted }]}>Шалгасан</Text>
              </View>
              <View style={s.coverBox}>
                <Text style={[s.coverLabel, { color: colors.textMuted }]}>Хамрах хүрээ</Text>
                <Text style={[s.coverVal, { color: colors.textBase }]}>
                  {stats.coverage.screened}/{stats.coverage.total}
                </Text>
              </View>
            </View>
            <View style={s.breakdown}>
              <Stat dot={colors.badgeGreen} label="Эрүүл" value={stats.triage.green} color={colors.textBase} muted={colors.textMuted} tile={colors.bg} border={colors.border} />
              <Stat dot={colors.badgeYellow} label="Анхааруул" value={stats.triage.yellow} color={colors.textBase} muted={colors.textMuted} tile={colors.bg} border={colors.border} />
              <Stat dot={colors.badgeRed} label="Яаралтай" value={stats.triage.red} color={colors.textBase} muted={colors.textMuted} tile={colors.bg} border={colors.border} />
            </View>
          </>
        )}
      </View>
    </View>
  )
}

const Stat = ({ dot, label, value, color, muted, tile, border }: {
  dot: string; label: string; value: number; color: string; muted: string; tile: string; border: string
}) => (
  <View style={[s.stat, { backgroundColor: tile, borderColor: border }]}>
    <View style={s.statTop}>
      <View style={[s.statDot, { backgroundColor: dot }]} />
      <Text style={[s.statValue, { color }]}>{value}</Text>
    </View>
    <Text style={[s.statLabel, { color: muted }]}>{label}</Text>
  </View>
)

const s = StyleSheet.create({
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.5, paddingBottom: 8 },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 14 },
  loader: { paddingVertical: 28 },
  empty: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  bigNum: { fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -0.5 },
  bigLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },
  coverBox: { alignItems: 'flex-end' },
  coverLabel: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  coverVal: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginTop: 2 },
  breakdown: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, gap: 6, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12, alignItems: 'center' },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statDot: { width: 10, height: 10, borderRadius: 5 },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 12 },
})

export default SchoolOverviewSection
