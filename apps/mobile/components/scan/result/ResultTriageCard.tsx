import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

export type TriageLevel = 'green' | 'yellow' | 'red'

// SCREENING-not-diagnosis wording: green never says "healthy"; no clinical words
// (цоорол/decay) — only "danger signs seen in THESE photos". Mirrors @pinequest/core.
const CONFIG: Record<TriageLevel, { label: string; subtitle: string; dotColor: string }> = {
  green: { label: 'Аюулын шинж илрээгүй', subtitle: 'Эдгээр зурагт тодорхой шинж тэмдэг харагдсангүй', dotColor: '#2A7D4F' },
  yellow: { label: 'Анхаарал шаардлагатай', subtitle: 'Шүдний эмчид үзүүлэхийг зөвлөж байна (яаралтай биш)', dotColor: '#8A6500' },
  red: { label: 'Яаралтай', subtitle: 'Аль болох хурдан шүдний эмчид хандана уу', dotColor: '#B83838' },
}

type Props = { level: TriageLevel; score: number }

export default function ResultTriageCard({ level, score }: Props) {
  const { colors } = useTheme()
  const bg = level === 'green' ? colors.triageGreenBg : level === 'yellow' ? colors.triageYellowBg : colors.triageRedBg
  const textColor = level === 'green' ? colors.triageGreenText : level === 'yellow' ? colors.triageYellowText : colors.triageRedText
  const { label, subtitle, dotColor } = CONFIG[level]
  const pct = Math.round(Math.min(100, score > 1 ? score : score * 100))

  return (
    <View style={[s.card, { backgroundColor: bg }]}>
      <View style={s.ring}>
        <View style={[s.dot, { backgroundColor: dotColor }]} />
      </View>
      <Text style={[s.label, { color: textColor }]}>{label}</Text>
      <Text style={[s.subtitle, { color: textColor }]}>{subtitle}</Text>
      {pct > 0 && (
        <View style={s.badge}>
          <Text style={[s.badgeText, { color: textColor }]}>Эрсдэлийн оноо · {pct}%</Text>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  card: { borderRadius: 20, padding: 28, alignItems: 'center', gap: 10 },
  ring: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  dot: { width: 38, height: 38, borderRadius: 19 },
  label: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  badge: { backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  badgeText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
})
