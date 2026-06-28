import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import type { VolunteerDentist } from '@/lib/api'

type Props = {
  dentist: VolunteerDentist
  distance: number
  isSelected: boolean
  onPress: () => void
}

const NearbyDentistCard = ({ dentist, distance, isSelected, onPress }: Props) => {
  const { colors } = useTheme()
  const initials = dentist.displayName.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2)

  return (
    <TouchableOpacity
      style={[s.card, { borderBottomColor: colors.border }, isSelected && { backgroundColor: colors.triageGreenBg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {dentist.avatarUrl ? (
        <Image source={{ uri: dentist.avatarUrl }} style={s.avatar} />
      ) : (
        <View style={[s.avatar, s.avatarFallback, { backgroundColor: colors.triageGreenBg }]}>
          <Text style={[s.initials, { color: colors.primary }]}>{initials}</Text>
        </View>
      )}
      <View style={s.info}>
        <Text style={[s.name, { color: colors.textBase }]} numberOfLines={1}>{dentist.displayName}</Text>
        <Text style={[s.meta, { color: colors.textMuted }]}>
          {dentist.specialty ?? dentist.org ?? ''}{dentist.specialty ? '' : ''} · {distance.toFixed(1)} км
        </Text>
        {dentist.area ? <Text style={[s.area, { color: colors.textDisabled }]} numberOfLines={1}>{dentist.area}</Text> : null}
      </View>
      <View style={s.actions}>
        {dentist.phone && (
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.surfaceRaised }]} onPress={() => void Linking.openURL(`sms:${dentist.phone}`)}>
            <Ionicons name="chatbubble-outline" size={17} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {dentist.phone && (
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.primary }]} onPress={() => void Linking.openURL(`tel:${dentist.phone}`)}>
            <Ionicons name="call-outline" size={17} color={colors.primaryText} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  info: { flex: 1 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 1 },
  area: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
})

export default NearbyDentistCard
