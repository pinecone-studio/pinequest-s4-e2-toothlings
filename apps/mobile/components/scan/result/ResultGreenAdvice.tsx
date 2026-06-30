import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

const TIPS = [
  'Өдөрт 2 удаа зөв угааж байгаагаа үргэлжлүүлэх',
  '6 сар тутамд хяналтын үзлэгт орох',
  'Чихэрлэг хүнс, ундааг хязгаарлах',
]

type Props = { homeSteps?: string[] }

export default function ResultGreenAdvice({ homeSteps }: Props) {
  const { colors } = useTheme()
  const steps = homeSteps ?? TIPS
  return (
    <View style={s.container}>
      <Text style={[s.label, { color: colors.textMuted }]}>ЗӨВЛӨМЖ</Text>
      {steps.map((tip, i) => (
        <View
          key={i}
          style={[s.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[s.check, { color: colors.triageGreenText }]}>✓</Text>
          <Text style={[s.text, { color: colors.textBase }]}>{tip}</Text>
        </View>
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  check: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  text: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
})
