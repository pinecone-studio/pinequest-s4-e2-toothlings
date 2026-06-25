import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

type Props = {
  icon: IoniconsName
  label: string
  onPress: () => void
}

const QuickActionCard = ({ icon, label, onPress }: Props) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[s.iconWrap, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={[s.label, { color: colors.textBase }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    flex: 1, aspectRatio: 1,
    borderRadius: 16, borderWidth: 1,
    alignItems: 'flex-start', justifyContent: 'space-between',
    padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold', lineHeight: 18 },
})

export default QuickActionCard
