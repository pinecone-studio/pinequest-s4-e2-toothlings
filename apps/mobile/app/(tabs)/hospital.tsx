import { Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import * as Location from 'expo-location'
import { useTheme } from '@/lib/ThemeContext'
import { useFloatingTabBarPad } from '@/lib/tabBarLayout'
import { useSession } from '@/lib/SessionContext'
import { roleConfigFor } from '@/lib/roleConfig'
import SegmentTabs from '@/components/hospital/SegmentTabs'
import DoctorList from '@/components/hospital/DoctorList'
import LocationPermission from '@/components/hospital/LocationPermission'
import ClinicMapView from '@/components/hospital/ClinicMapView'
import HelpRequestsSection from '@/components/dentist/HelpRequestsSection'

type Segment = 'doctors' | 'map'
type Coords = { lat: number; lng: number }

const HospitalScreen = () => {
  const { colors } = useTheme()
  const tabBarPad = useFloatingTabBarPad()
  const { activeRole } = useSession()
  const config = roleConfigFor(activeRole)
  const { segment: initialSegment } = useLocalSearchParams<{ segment?: string }>()
  const [segment, setSegment] = useState<Segment>(initialSegment === 'map' ? 'map' : 'doctors')
  const [coords, setCoords] = useState<Coords | null>(null)

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return
    const loc = await Location.getCurrentPositionAsync({})
    setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude })
  }

  // Dentists review incoming help requests here instead of searching for a doctor.
  if (config.tabs.hospitalMode === 'help-requests') {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={[s.root, { backgroundColor: colors.bg }]}>
        <Text style={[s.pageTitle, { color: colors.textBase }]}>{config.tabs.hospitalLabel}</Text>
        <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: tabBarPad }]} showsVerticalScrollIndicator={false}>
          <HelpRequestsSection />
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[s.root, { backgroundColor: colors.bg }]}>
      <Text style={[s.pageTitle, { color: colors.textBase }]}>{config.tabs.hospitalLabel}</Text>
      <SegmentTabs active={segment} onChange={setSegment} />
      {segment === 'doctors' ? (
        <DoctorList />
      ) : coords ? (
        <ClinicMapView userLat={coords.lat} userLng={coords.lng} />
      ) : (
        <LocationPermission onAllow={requestLocation} />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  pageTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  scroll: { padding: 16, gap: 12 },
})

export default HospitalScreen
