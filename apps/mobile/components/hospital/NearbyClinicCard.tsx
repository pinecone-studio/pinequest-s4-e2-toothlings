import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import { directionsUrl, type Clinic } from '@/lib/clinics'

type Props = {
  clinic: Clinic
  distance: number
  isSelected: boolean
  onPress: () => void
}

const NearbyClinicCard = ({ clinic, distance, isSelected, onPress }: Props) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={[
        s.card,
        { borderBottomColor: colors.border },
        isSelected && { backgroundColor: colors.triageGreenBg },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[s.iconWrap, { backgroundColor: colors.triageGreenBg }]}>
        <Ionicons name="medkit" size={22} color={colors.triageGreenText} />
      </View>
      <View style={s.info}>
        <Text style={[s.name, { color: colors.textBase }]} numberOfLines={1}>
          {clinic.name}
        </Text>
        <Text style={[s.meta, { color: colors.textMuted }]} numberOfLines={1}>
          {[
            clinic.rating != null ? `⭐ ${clinic.rating}` : null,
            `${distance.toFixed(1)} км`,
            clinic.hours || null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
      <View style={s.actions}>
        {clinic.phone && (
          <TouchableOpacity
            style={[s.iconBtn, { backgroundColor: colors.surfaceRaised }]}
            onPress={() => Linking.openURL(`tel:${clinic.phone}`)}
          >
            <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[s.iconBtn, { backgroundColor: colors.primary }]}
          onPress={() => Linking.openURL(directionsUrl(clinic))}
        >
          <Ionicons name="navigate" size={18} color={colors.primaryText} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default NearbyClinicCard
