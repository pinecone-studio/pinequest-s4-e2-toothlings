import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import QuickActionCard from './QuickActionCard'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

type Action = { id: string; icon: IoniconsName; label: string; onPress: () => void }

type Props = { actions: Action[] }

const QuickActionGrid = ({ actions }: Props) => (
  <View style={s.grid}>
    {actions.slice(0, 4).map((a) => (
      <QuickActionCard key={a.id} icon={a.icon} label={a.label} onPress={a.onPress} />
    ))}
  </View>
)

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
})

export default QuickActionGrid
