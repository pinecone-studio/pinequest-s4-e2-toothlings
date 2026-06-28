import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useMemo } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { CLINICS, distanceKm, type Clinic } from '@/lib/clinics'
import type { VolunteerDentist } from '@/lib/api'
import NearbyClinicCard from './NearbyClinicCard'
import NearbyDentistCard from './NearbyDentistCard'

type Props = {
  userLat: number
  userLng: number
  selectedId?: string
  onSelect: (id: string, kind: 'clinic' | 'dentist') => void
  dentists?: VolunteerDentist[]
}

const NearbyClinicList = ({ userLat, userLng, selectedId, onSelect, dentists = [] }: Props) => {
  const { colors } = useTheme()

  const sortedClinics = useMemo(
    () => [...CLINICS].map((c) => ({ ...c, dist: distanceKm(c, userLat, userLng) })).sort((a, b) => a.dist - b.dist),
    [userLat, userLng]
  )

  const sortedDentists = useMemo(
    () =>
      dentists
        .filter((d) => d.lat != null && d.lng != null)
        .map((d) => ({ ...d, dist: distanceKm({ lat: d.lat!, lng: d.lng! } as Clinic, userLat, userLng) }))
        .sort((a, b) => a.dist - b.dist),
    [dentists, userLat, userLng]
  )

  return (
    <View style={[s.sheet, { backgroundColor: colors.surface }]}>
      <View style={[s.handle, { backgroundColor: colors.border }]} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {sortedDentists.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: colors.textMuted }]}>Сайн дурын эмч нар</Text>
            {sortedDentists.map((d) => (
              <NearbyDentistCard
                key={d.id}
                dentist={d}
                distance={d.dist}
                isSelected={d.id === selectedId}
                onPress={() => onSelect(d.id, 'dentist')}
              />
            ))}
          </>
        )}
        <Text style={[s.sectionTitle, { color: colors.textMuted }]}>Эмнэлгүүд ({sortedClinics.length})</Text>
        {sortedClinics.map((c) => (
          <NearbyClinicCard
            key={c.id}
            clinic={c}
            distance={c.dist}
            isSelected={c.id === selectedId}
            onPress={() => onSelect(c.id, 'clinic')}
          />
        ))}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 8, marginBottom: 4 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, paddingHorizontal: 16, paddingVertical: 6 },
})

export default NearbyClinicList
