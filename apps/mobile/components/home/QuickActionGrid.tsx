import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import QuickActionCard from './QuickActionCard'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

type Action = { id: string; icon: IoniconsName; label: string; onPress: () => void }

type Props = { actions: Action[] }

const QuickActionGrid = ({ actions }: Props) => {
  const rows = [actions.slice(0, 2), actions.slice(2, 4)]
  return (
    <View style={s.grid}>
      {rows.map((row, i) => (
        <View key={i} style={s.row}>
          {row.map((a) => (
            <QuickActionCard key={a.id} icon={a.icon} label={a.label} onPress={a.onPress} />
          ))}
        </View>
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  grid: { flex: 1, gap: 10 },
  row: { flex: 1, flexDirection: 'row', gap: 10 },
})

export default QuickActionGrid
