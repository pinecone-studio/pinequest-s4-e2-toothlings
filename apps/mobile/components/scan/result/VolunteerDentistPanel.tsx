import { useState } from 'react'
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import { useVolunteerDentists } from '@/lib/useVolunteerDentists'
import type { VolunteerDentist } from '@/lib/api'
import VolunteerDentistRow from './VolunteerDentistRow'
import ScheduleSheet from './ScheduleSheet'

type Props = { childKey: string }

// Red-result dentist picker: a horizontal row of profile cards. Tap an available
// dentist to schedule a video call. Empty when offline — the emergency options above
// still work, so this stays an additive "connect to a dentist" path.
const VolunteerDentistPanel = ({ childKey }: Props) => {
  const { colors } = useTheme()
  const { data, loading } = useVolunteerDentists()
  const [picked, setPicked] = useState<VolunteerDentist | null>(null)

  return (
    <View style={s.wrap}>
      <Text style={[s.title, { color: colors.textBase }]}>Сайн дурын эмчтэй холбогдох</Text>
      <Text style={[s.sub, { color: colors.textMuted }]}>Эмч сонгож видео дуудлагын цаг товлоно уу</Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={s.loader} />
      ) : data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={(d) => d.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <VolunteerDentistRow dentist={item} onPress={() => setPicked(item)} />
          )}
        />
      ) : (
        <Text style={[s.empty, { color: colors.textMuted, borderColor: colors.border }]}>
          Танд туслах эмч одоогоор холбогдох боломжгүй (офлайн).
        </Text>
      )}

      <ScheduleSheet dentist={picked} childKey={childKey} onClose={() => setPicked(null)} />
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { gap: 4, marginTop: 2 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 12, marginBottom: 6 },
  loader: { marginVertical: 16 },
  list: { paddingVertical: 4, paddingRight: 4 },
  empty: { fontFamily: 'Inter_400Regular', fontSize: 12, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 14, textAlign: 'center' },
})

export default VolunteerDentistPanel
