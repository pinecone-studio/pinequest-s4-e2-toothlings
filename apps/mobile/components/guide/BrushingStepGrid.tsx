import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import BrushingStepCard, { BrushingStep } from './BrushingStepCard'

type Props = { steps: BrushingStep[] }

export default function BrushingStepGrid({ steps }: Props) {
  const { colors } = useTheme()
  const rows: BrushingStep[][] = []
  for (let i = 0; i < steps.length; i += 2) rows.push(steps.slice(i, i + 2))

  return (
    <View style={s.container}>
      <Text style={[s.sectionLabel, { color: colors.textMuted }]}>АЛХАМ АЛХМААР</Text>
      <View style={s.grid}>
        {rows.map((pair, i) => (
          <View key={i} style={s.row}>
            {pair.map((step, j) => (
              <BrushingStepCard key={j} {...step} />
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 20 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 10 },
  grid: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
})
