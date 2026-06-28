import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import type { ListDoctor } from '@/lib/doctorsData'

type Props = {
  doctor: ListDoctor
  onPress: () => void
}

const DoctorCard = ({ doctor, onPress }: Props) => {
  const { colors } = useTheme()
  const initials = doctor.name.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2)

  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {doctor.avatarUrl ? (
        <Image source={{ uri: doctor.avatarUrl }} style={s.avatar} />
      ) : (
        <View style={[s.avatar, s.avatarFallback, { backgroundColor: colors.triageGreenBg }]}>
          <Text style={[s.avatarText, { color: colors.primary }]}>{initials}</Text>
        </View>
      )}
      <View style={s.info}>
        <Text style={[s.name, { color: colors.textBase }]}>{doctor.name}</Text>
        {doctor.specialty && (
          <Text style={[s.specialty, { color: colors.textMuted }]}>{doctor.specialty}</Text>
        )}
        {(doctor.clinic || doctor.area) && (
          <Text style={[s.clinic, { color: colors.textSecondary }]}>
            {[doctor.clinic, doctor.area].filter(Boolean).join(' · ')}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  info: { flex: 1 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  specialty: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  clinic: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
})

export default DoctorCard
