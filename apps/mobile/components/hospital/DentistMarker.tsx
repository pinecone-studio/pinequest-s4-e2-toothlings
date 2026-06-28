import { View, Text, Image, StyleSheet } from 'react-native'
import { Marker } from 'react-native-maps'
import type { VolunteerDentist } from '@/lib/api'

type Props = {
  dentist: VolunteerDentist
  isSelected: boolean
  onPress: () => void
}

const DentistMarker = ({ dentist, isSelected, onPress }: Props) => {
  if (dentist.lat == null || dentist.lng == null) return null

  const initials = dentist.displayName.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2)
  const size = isSelected ? 48 : 38

  return (
    <Marker
      coordinate={{ latitude: dentist.lat, longitude: dentist.lng }}
      onPress={onPress}
      title={dentist.displayName}
      description={dentist.specialty ?? dentist.area ?? undefined}
    >
      <View style={[s.pin, { width: size, height: size, borderRadius: size / 2, borderColor: isSelected ? '#ef4444' : '#fff', borderWidth: isSelected ? 3 : 2 }]}>
        {dentist.avatarUrl ? (
          <Image source={{ uri: dentist.avatarUrl }} style={[s.img, { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]} />
        ) : (
          <View style={[s.fallback, { backgroundColor: isSelected ? '#ef4444' : '#6b7280' }]}>
            <Text style={[s.initials, { fontSize: isSelected ? 15 : 12 }]}>{initials}</Text>
          </View>
        )}
      </View>
    </Marker>
  )
}

const s = StyleSheet.create({
  pin: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  img: { resizeMode: 'cover' },
  fallback: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: 'Inter_700Bold', color: '#fff' },
})

export default DentistMarker
