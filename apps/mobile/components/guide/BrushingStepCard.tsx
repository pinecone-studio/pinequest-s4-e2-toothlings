import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

export type BrushingStep = {
  name: string
  description: string
}

export default function BrushingStepCard({ name, description }: BrushingStep) {
  const { colors } = useTheme()
  return (
    <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[s.name, { color: colors.textBase }]}>{name}</Text>
      <Text style={[s.desc, { color: colors.textMuted }]}>{description}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  card: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, gap: 5 },
  name: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  desc: { fontSize: 12, fontFamily: 'Inter_400Regular' },
})
