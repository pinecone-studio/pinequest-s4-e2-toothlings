import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { getMyScreenings, getMyClasses, getRosterStatus } from '@/lib/api'
import type { ScreeningRow } from '@/lib/profileData'

type Props = { userId: string; role?: string }

const toDate = (ts: number | string) =>
  typeof ts === 'number'
    ? new Date(ts).toISOString().slice(0, 10)
    : new Date(ts).toISOString().slice(0, 10)

const HistorySection = ({ userId, role }: Props) => {
  const { colors } = useTheme()
  const [rows, setRows] = useState<ScreeningRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (role === 'teacher') {
      getMyClasses()
        .then(async (classes) => {
          const rosters = await Promise.all(
            classes.map((c) =>
              getRosterStatus(c.id).then((students) =>
                students.map((s) => ({ ...s, classId: c.id })),
              ),
            ),
          )
          const screened = rosters.flat().filter((s) => s.screenedAt && s.latestLevel)
          setRows(
            screened.map((s) => ({
              id: s.childKey,
              childName: `${s.lastName} ${s.firstName}`,
              triageLevel: s.latestLevel!,
              date: toDate(s.screenedAt!),
              classId: s.classId,
            })),
          )
        })
        .catch(() => setRows([]))
        .finally(() => setLoading(false))
    } else {
      getMyScreenings(userId)
        .then((items) =>
          setRows(
            items.map((s) => ({
              id: s.id,
              childName: '',
              triageLevel: s.triageLevel,
              date: toDate(s.capturedAt),
              classId: s.classId,
            })),
          ),
        )
        .catch(() => setRows([]))
        .finally(() => setLoading(false))
    }
  }, [userId, role])

  // Per-child screening counts by triage level. A growing raw list isn't useful
  // on the profile (and there's a separate Дүгнэлт list), so we summarize: how
  // many children screened, and the breakdown by danger level — a glanceable
  // total that stays the same height as more children are added.
  const total = rows.length
  const green = rows.filter((r) => r.triageLevel === 'green').length
  const red = rows.filter((r) => r.triageLevel === 'red').length
  const yellow = total - green - red
  const lastDate = rows.reduce<string | null>(
    (max, r) => (!max || r.date > max ? r.date : max),
    null,
  )

  return (
    <View>
      <Text style={[s.sectionTitle, { color: colors.textMuted }]}>Өмнөх дүгнэлтүүд</Text>
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={s.loader} />
        ) : total === 0 ? (
          <Text style={[s.empty, { color: colors.textDisabled }]}>Одоогоор дүгнэлт байхгүй байна</Text>
        ) : (
          <View style={s.summary}>
            <View style={s.totalRow}>
              <View>
                <Text style={[s.totalNum, { color: colors.textBase }]}>{total}</Text>
                <Text style={[s.totalLabel, { color: colors.textMuted }]}>Шалгасан хүүхэд</Text>
              </View>
              {lastDate ? (
                <View style={s.lastBox}>
                  <Text style={[s.lastLabel, { color: colors.textMuted }]}>Сүүлд</Text>
                  <Text style={[s.lastDate, { color: colors.textBase }]}>{lastDate}</Text>
                </View>
              ) : null}
            </View>
            <View style={s.breakdown}>
              <Stat
                dot={colors.badgeGreen}
                label="Эрүүл"
                value={green}
                color={colors.textBase}
                muted={colors.textMuted}
                tile={colors.bg}
                border={colors.border}
              />
              <Stat
                dot={colors.primary}
                label="Анхааруул"
                value={yellow}
                color={colors.textBase}
                muted={colors.textMuted}
                tile={colors.bg}
                border={colors.border}
              />
              <Stat
                dot={colors.badgeRed}
                label="Яаралтай"
                value={red}
                color={colors.textBase}
                muted={colors.textMuted}
                tile={colors.bg}
                border={colors.border}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

const Stat = ({
  dot,
  label,
  value,
  color,
  muted,
  tile,
  border,
}: {
  dot: string
  label: string
  value: number
  color: string
  muted: string
  tile: string
  border: string
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
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
    paddingBottom: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  loader: {
    paddingVertical: 28,
  },
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 28,
  },
  summary: { padding: 16, gap: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  totalNum: { fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -0.5 },
  totalLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },
  lastBox: { alignItems: 'flex-end' },
  lastLabel: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  lastDate: { fontFamily: 'Inter_500Medium', fontSize: 14, marginTop: 2 },
  breakdown: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, gap: 6, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12, alignItems: 'center' },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statDot: { width: 10, height: 10, borderRadius: 5 },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 12 },
})

export default HistorySection
