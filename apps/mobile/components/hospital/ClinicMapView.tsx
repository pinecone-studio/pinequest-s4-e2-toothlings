import { StyleSheet, View } from 'react-native'
import { useState } from 'react'
import MapView from 'react-native-maps'
import { UB_CENTER } from '@/lib/clinics'
import { useNearbyClinics } from '@/lib/useNearbyClinics'
import { useVolunteerDentists } from '@/lib/useVolunteerDentists'
import ClinicMarker from './ClinicMarker'
import DentistMarker from './DentistMarker'
import NearbyClinicList from './NearbyClinicList'

type Props = {
  userLat: number
  userLng: number
}

const ClinicMapView = ({ userLat, userLng }: Props) => {
  const { data: dentists } = useVolunteerDentists()
  const { clinics, loading } = useNearbyClinics(userLat, userLng)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = (id: string) => setSelectedId((prev) => (prev === id ? null : id))

  // Choose a center that fits user location or Mongolia-wide if rural (far from UB)
  const isNearUB =
    Math.abs(userLat - UB_CENTER.lat) < 1.5 && Math.abs(userLng - UB_CENTER.lng) < 2
  const initialRegion = isNearUB
    ? { latitude: UB_CENTER.lat, longitude: UB_CENTER.lng, latitudeDelta: 0.06, longitudeDelta: 0.06 }
    : { latitude: userLat, longitude: userLng, latitudeDelta: 3, longitudeDelta: 3 }

  return (
    <View style={s.root}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {clinics.map((clinic) => (
          <ClinicMarker
            key={clinic.id}
            clinic={clinic}
            isSelected={selectedId === clinic.id}
            onPress={() => handleSelect(clinic.id)}
          />
        ))}
        {dentists.map((d) => (
          <DentistMarker
            key={d.id}
            dentist={d}
            isSelected={selectedId === d.id}
            onPress={() => handleSelect(d.id)}
          />
        ))}
      </MapView>
      <NearbyClinicList
        userLat={userLat}
        userLng={userLng}
        clinics={clinics}
        loading={loading}
        selectedId={selectedId ?? undefined}
        onSelect={handleSelect}
        dentists={dentists}
      />
    </View>
  )
}

const s = StyleSheet.create({ root: { flex: 1 } })

export default ClinicMapView
