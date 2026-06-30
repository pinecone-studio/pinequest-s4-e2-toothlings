import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import { overallProgress, quadrantProgress, surfaceProgress, zoneStatus } from '@/lib/brush/coverageQuery'
import type { ZoneStatus } from '@/lib/brush/coverageQuery'
import type { CoverageState } from '@/lib/brush/coverageState'
import { brushLabelMn, quadrantLabelMn, surfaceLabelMn, QUADRANTS, SURFACES } from '@/lib/brush/zones'

const STATUS_COLOR: Record<ZoneStatus, string> = { clean: '#52A075', partial: '#F2B705', missed: '#CBD5E1' }

type Props = { coverage: CoverageState; currentZone: string }

/** Live per-zone coverage bars — 4 quadrants × 3 surfaces, motion-gated. */
export const BrushZoneCoverage = ({ coverage, currentZone }: Props) => {
  const { colors } = useTheme()
  const overall = overallProgress(coverage)

  const Bar = ({ value, active }: { value: number; active: boolean }) => (
    <View style={[s.track, { backgroundColor: colors.border }]}>
      <View style={[s.fill, { width: `${Math.round(value * 100)}%`, backgroundColor: STATUS_COLOR[zoneStatus(value)] }, active && s.activeFill]} />
    </View>
  )

  return (
    <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[s.label, { color: colors.textMuted }]}>БҮСИЙН ХАМРАЛТ</Text>
      <Text style={[s.now, { color: colors.textSecondary }]}>
        Одоо угааж буй: <Text style={{ color: colors.textBase, fontFamily: 'Inter_600SemiBold' }}>{brushLabelMn(currentZone)}</Text>
      </Text>

      <View style={s.overallRow}>
        <Bar value={overall / 100} active={false} />
        <Text style={[s.overallPct, { color: colors.textBase }]}>{overall}%</Text>
      </View>

      <View style={s.grid}>
        {QUADRANTS.map((q) => {
          const activeQuad = currentZone.startsWith(`${q}-`)
          return (
            <View key={q} style={[s.quad, { borderColor: activeQuad ? colors.primary : colors.border, backgroundColor: activeQuad ? colors.primarySoft : colors.surface }]}>
              <View style={s.quadHead}>
                <Text style={[s.quadName, { color: colors.textBase }]}>{quadrantLabelMn(q)}</Text>
                <Text style={[s.quadPct, { color: colors.textMuted }]}>{Math.round(quadrantProgress(coverage, q) * 100)}%</Text>
              </View>
              {SURFACES.map((sf) => (
                <View key={sf} style={s.surfaceRow}>
                  <Text style={[s.surfaceName, { color: colors.textMuted }]}>{surfaceLabelMn(sf)}</Text>
                  <Bar value={surfaceProgress(coverage, q, sf)} active={currentZone === `${q}-${sf}`} />
                </View>
              ))}
            </View>
          )
        })}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 14 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  now: { marginTop: 4, fontSize: 13, fontFamily: 'Inter_400Regular' },
  overallRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 12 },
  overallPct: { width: 42, textAlign: 'right', fontSize: 14, fontFamily: 'Inter_700Bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quad: { width: '47.5%', borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 10 },
  quadHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  quadName: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  quadPct: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  surfaceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  surfaceName: { width: 40, fontSize: 11, fontFamily: 'Inter_400Regular' },
  track: { flex: 1, height: 8, borderRadius: 9999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 9999 },
  activeFill: { borderWidth: 1.5, borderColor: '#F2B705' },
})
