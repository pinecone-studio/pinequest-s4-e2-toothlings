import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { guidanceLines } from '@pinequest/core'
import { useTheme } from '@/lib/ThemeContext'
import type { ChildScreeningSummary, ScreeningGuidance, TriageLevel } from '@pinequest/types'

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

// Gemini-ийн дэлгэрэнгүй зөвлөмжийн талбаруудыг гарчигтай алхам болгон харуулна.
const GUIDANCE_STEP_LABELS: { key: keyof ScreeningGuidance; label: string }[] = [
  { key: 'homeCare', label: 'Гэртээ' },
  { key: 'brushing', label: 'Шүд угаах' },
  { key: 'diet', label: 'Хоол хүнс' },
  { key: 'prevention', label: 'Урьдчилан сэргийлэх' },
  { key: 'nextStep', label: 'Дараагийн алхам' },
]

type Props = {
  summary: ChildScreeningSummary | null
  level: TriageLevel
  advice?: string | null
  guidance?: ScreeningGuidance | null
}

/**
 * "AI summary": Дүгнэлт + Цаашид хэвшүүлэх арга хэмжээ.
 * `advice` ирвэл (server дэх Gemini) түүнийг дүгнэлт болгон харуулна — web-тэй ижил.
 * `guidance` ирвэл нас тохирсон дэлгэрэнгүй зөвлөмжийг арга хэмжээ болгон харуулна.
 * Offline/local fallback үед deterministic buildChildSummary руу буцна.
 */
const ResultSummary = ({ summary, level, advice, guidance }: Props) => {
  const { colors } = useTheme()
  const [adviceOpen, setAdviceOpen] = useState(false)
  const lvl = summary?.effectiveLevel ?? level
  const rawConclusion = advice ? [advice] : (summary?.conclusion ?? [FALLBACK_LEAD[lvl]])
  // Урт үргэлжилсэн текстийг өгүүлбэр бүрээр салгаж тус тусдаа мөр болгоно.
  const conclusion = rawConclusion
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((line) => line.trim())
    .filter(Boolean)
  // Gemini-ийн (тогтмолжуулсан) зөвлөмжийн талбар бүрийг гарчигтай, цэгэн жагсаалттай
  // блок болгоно — web-тэй ижил. Guidance ирээгүй үед deterministic fallback алхмууд.
  const guidanceGroups = guidance
    ? GUIDANCE_STEP_LABELS.filter((g) => guidance[g.key]?.trim()).map((g) => ({
        label: g.label,
        lines: guidanceLines(guidance[g.key] ?? ''),
      }))
    : []
  const fallbackSteps = summary?.homeSteps ?? FALLBACK_STEPS[lvl]
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
      {/* "Цаашид хэвшүүлэх арга хэмжээ" нь "Зөвлөмж" товч дор эвхэгдсэн — дарж дэлгэнэ. */}
      <TouchableOpacity
        style={[s.adviceToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setAdviceOpen((o) => !o)}
        activeOpacity={0.7}
      >
        <Ionicons name="bulb-outline" size={18} color={fg} />
        <Text style={[s.adviceToggleText, { color: colors.textBase }]}>Зөвлөмж</Text>
        <Ionicons name={adviceOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </TouchableOpacity>
      {adviceOpen ? (
        <Text style={[s.label, { color: colors.textMuted, marginTop: 2 }]}>ЦААШИД ХЭВШҮҮЛЭХ АРГА ХЭМЖЭЭ</Text>
      ) : null}
      {adviceOpen
        ? guidanceGroups.length
          ? guidanceGroups.map((grp, i) => (
              <View key={i} style={[s.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.groupLabel, { color: colors.textMuted }]}>{grp.label}</Text>
                {grp.lines.map((line, j) => (
                  <View key={j} style={s.bulletRow}>
                    <Text style={[s.check, { color: fg }]}>✓</Text>
                    <Text style={[s.stepText, { color: colors.textBase }]}>{line}</Text>
                  </View>
                ))}
              </View>
            ))
          : fallbackSteps.map((step, i) => (
              <View key={i} style={[s.step, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.check, { color: fg }]}>✓</Text>
                <Text style={[s.stepText, { color: colors.textBase }]}>{step}</Text>
              </View>
            ))
        : null}
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
  adviceToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, borderWidth: StyleSheet.hairlineWidth, marginTop: 6 },
  adviceToggleText: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  group: { borderRadius: 14, padding: 14, borderWidth: StyleSheet.hairlineWidth, gap: 8 },
  groupLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6, textTransform: 'uppercase' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: StyleSheet.hairlineWidth },
  check: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  stepText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
})
