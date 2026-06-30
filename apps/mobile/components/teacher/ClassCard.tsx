import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { seasonLabelMn } from '@pinequest/core'
import { useTheme } from '@/lib/ThemeContext'
import type { TeacherClass } from '@/lib/api'
import CoverageBar from './CoverageBar'

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' }) : 'Товлоогүй'

const ClassCard = ({ klass, onPress }: { klass: TeacherClass; onPress: () => void }) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={s.top}>
        <View style={s.titleWrap}>
          <Text style={[s.name, { color: colors.textBase }]}>{klass.name}</Text>
          <Text style={[s.season, { color: colors.textMuted }]}>
            {seasonLabelMn(klass.seasonId)}{klass.gradeLevel ? ` · ${klass.gradeLevel}-р анги` : ''}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
      <CoverageBar screened={klass.screened} enrolled={klass.enrolled} />
      <View style={s.foot}>
        <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
        <Text style={[s.footText, { color: colors.textMuted }]}>Дараагийн хяналт: {fmtDate(klass.scheduledAt)}</Text>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 12 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleWrap: { gap: 2 },
  name: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  season: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
})

export default ClassCard
