import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import type { VolunteerDentist } from '@/lib/api'

type Props = { dentist: VolunteerDentist; onPress: () => void }

// Profile card (avatar → name → specialty → experience → availability bar) styled
// like the reference card. Busy dentists render dimmed and are not pressable.
const VolunteerDentistRow = ({ dentist, onPress }: Props) => {
  const { colors } = useTheme()
  const available = dentist.isAvailable
  const initials = dentist.displayName.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2)
  const dot = available ? colors.triageGreenText : colors.textDisabled

  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: available ? 1 : 0.55 }]}
      onPress={onPress}
      disabled={!available}
      activeOpacity={0.8}
    >
      <View style={s.avatarWrap}>
        {dentist.avatarUrl ? (
          <Image source={{ uri: dentist.avatarUrl }} style={s.avatar} />
        ) : (
          <View style={[s.avatar, s.avatarFallback, { backgroundColor: colors.triageGreenBg }]}>
            <Text style={[s.avatarText, { color: colors.primary }]}>{initials}</Text>
          </View>
        )}
        <View style={[s.dot, { backgroundColor: dot, borderColor: colors.surface }]} />
      </View>

      <Text style={[s.name, { color: colors.textBase }]} numberOfLines={1}>{dentist.displayName}</Text>
      {!!dentist.specialty && (
        <Text style={[s.specialty, { color: colors.textMuted }]} numberOfLines={1}>{dentist.specialty}</Text>
      )}

      <View style={s.meta}>
        <Ionicons name="time-outline" size={13} color={colors.textMuted} />
        <Text style={[s.metaText, { color: colors.textSecondary }]}>
          {dentist.experienceYears != null ? `${dentist.experienceYears} жил туршлага` : 'Сайн дурын эмч'}
        </Text>
      </View>

      <View style={[s.bar, { backgroundColor: colors.border }]}>
        <View style={[s.barSeg, { flex: 0.7, backgroundColor: available ? colors.triageGreenText : colors.textDisabled }]} />
        <View style={[s.barSeg, { flex: 0.3, backgroundColor: available ? colors.primary : colors.border }]} />
      </View>
      <Text style={[s.status, { color: dot }]}>{available ? '● Боломжтой' : '● Завгүй'}</Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    width: 168, padding: 14, borderRadius: 18, borderWidth: 1, marginRight: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  avatarWrap: { width: 52, height: 52, marginBottom: 10 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  dot: { position: 'absolute', right: -1, bottom: -1, width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  specialty: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  metaText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  bar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 10 },
  barSeg: { height: 6 },
  status: { fontFamily: 'Inter_500Medium', fontSize: 11, marginTop: 6 },
})

export default VolunteerDentistRow
