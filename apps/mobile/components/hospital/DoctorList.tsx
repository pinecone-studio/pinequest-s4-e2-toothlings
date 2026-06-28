import { FlatList, View, ActivityIndicator, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useVolunteerDentists } from '@/lib/useVolunteerDentists'
import { STATIC_LIST_DOCTORS, type ListDoctor } from '@/lib/doctorsData'
import { useTheme } from '@/lib/ThemeContext'
import DoctorCard from './DoctorCard'

const DoctorList = () => {
  const router = useRouter()
  const { colors } = useTheme()
  const { data: apiDentists, loading } = useVolunteerDentists()

  // Prefer live volunteer dentists; fall back to static clinic list when API returns empty.
  const doctors: ListDoctor[] = apiDentists.length > 0
    ? apiDentists.map((d) => ({
        id: d.id,
        name: d.displayName,
        specialty: d.specialty,
        clinic: d.org,
        area: d.area,
        avatarUrl: d.avatarUrl,
        phone: d.phone,
      }))
    : STATIC_LIST_DOCTORS

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  return (
    <FlatList
      data={doctors}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <DoctorCard
          doctor={item}
          onPress={() =>
            router.push({
              pathname: '/hospital/doctor',
              params: {
                id: item.id,
                name: item.name,
                specialty: item.specialty ?? '',
                clinic: item.clinic ?? '',
                area: item.area ?? '',
                avatarUrl: item.avatarUrl ?? '',
                phone: item.phone ?? '',
              },
            })
          }
        />
      )}
      contentContainerStyle={s.list}
      showsVerticalScrollIndicator={false}
    />
  )
}

const s = StyleSheet.create({
  list: { paddingTop: 4, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})

export default DoctorList
