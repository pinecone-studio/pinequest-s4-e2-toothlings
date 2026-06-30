import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import type { ChildScreeningSummary, TriageLevel } from '@pinequest/types'

// Used only when age is unknown (summary === null). Hedged, screening-not-diagnosis.
const FALLBACK_LEAD: Record<TriageLevel, string> = {
  green: 'Эдгээр зурагт аюулын тод шинж ажиглагдсангүй. Энэ нь онош биш тул хяналтаа үргэлжлүүлээрэй.',
  yellow: 'Анхаарал шаардсан шинж ажиглагдлаа. Шүдний эмчид үзүүлэхийг зөвлөж байна.',
  red: 'Нэн анхаарал шаардсан шинж ажиглагдлаа. Аль болох хурдан шүдний эмчид хандана уу.',
}

const FALLBACK_STEPS: Record<TriageLevel, string[]> = {
  green: ['Өдөрт 2 удаа фтортой оохойгоор шүдээ угаах.', 'Чихэрлэг хоол, ундааны хэрэглээг багасгах.', '6 сар тутамд хяналтын үзлэгт орох.'],
  yellow: ['Өдөрт 2 удаа фтортой оохойгоор шүдээ угаах.', 'Чихэрлэг хоол, ундааны хэрэглээг багасгах.', '1–2 долоо хоногийн дотор шүдний эмчид үзүүлэх.'],
  red: ['Өдөрт 2 удаа фтортой оохойгоор шүдээ угаах.', 'Чихэрлэг хоол, ундааны хэрэглээг багасгах.', 'Өвдөлт, хавдар, эсвэл халуурвал яаралтай эмнэлэгт хандах.'],
}

type Props = { summary: ChildScreeningSummary | null; level: TriageLevel; advice?: string | null }

/**
 * "AI summary": Дүгнэлт + Цаашид хэвшүүлэх арга хэмжээ.
 * `advice` ирвэл (server дэх Gemini) түүнийг дүгнэлт болгон харуулна — web-тэй ижил.
 * Offline/local fallback үед deterministic buildChildSummary руу буцна.
 */
const ResultSummary = ({ summary, level, advice }: Props) => {
  const { colors } = useTheme()
  const lvl = summary?.effectiveLevel ?? level
  const rawConclusion = advice ? [advice] : (summary?.conclusion ?? [FALLBACK_LEAD[lvl]])
  // Урт үргэлжилсэн текстийг өгүүлбэр бүрээр салгаж тус тусдаа мөр болгоно.
  const conclusion = rawConclusion
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((line) => line.trim())
    .filter(Boolean)
  const steps = summary?.homeSteps ?? FALLBACK_STEPS[lvl]
  const bg = lvl === 'green' ? colors.triageGreenBg : lvl === 'yellow' ? colors.triageYellowBg : colors.triageRedBg
  const fg = lvl === 'green' ? colors.triageGreenText : lvl === 'yellow' ? colors.triageYellowText : colors.triageRedText

  return (
    <View style={s.container}>
      <Text style={[s.label, { color: colors.textMuted }]}>ДҮГНЭЛТ</Text>
      <View style={[s.card, { backgroundColor: bg }]}>
        {conclusion.map((line, i) => (
          <View key={i} style={s.bulletRow}>
            <Text style={[s.bullet, { color: fg }]}>•</Text>
            <Text style={[s.line, { color: fg }]}>{line}</Text>
          </View>
        ))}
      </View>
      <Text style={[s.label, { color: colors.textMuted, marginTop: 6 }]}>ЦААШИД ХЭВШҮҮЛЭХ АРГА ХЭМЖЭЭ</Text>
      {steps.map((step, i) => (
        <View key={i} style={[s.step, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.check, { color: fg }]}>✓</Text>
          <Text style={[s.stepText, { color: colors.textBase }]}>{step}</Text>
        </View>
      ))}
    </View>
  )
}

export default ResultSummary

const s = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 2 },
  card: { borderRadius: 16, padding: 16, gap: 8 },
  bulletRow: { flexDirection: 'row', gap: 8 },
  bullet: { fontSize: 14, lineHeight: 20 },
  line: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: StyleSheet.hairlineWidth },
  check: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  stepText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
})
