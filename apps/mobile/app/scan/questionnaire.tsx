import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'

type Q = { key: string; text: string; type: 'bool' | 'choice'; choices?: string[] }

const QUESTIONS: Q[] = [
  { key: 'toothPain', text: 'Өвддөг шүд байгаа юу?', type: 'bool' },
  {
    key: 'painTrigger', text: 'Ямар үед өвддөг вэ?', type: 'choice', choices: [
      'Хүйтэн зүйл идэхэд өвддөг',
      'Халуун зүйл идэхэд өвддөг',
      'Өөрөө аяндаа өвддөг',
      'Шөнө өвддөг',
    ],
  },
  {
    key: 'painDuration', text: 'Хэзээнээс өвдөж эхлэсэн бэ?', type: 'choice', choices: [
      'Өчигдрөөс',
      '2-оос дээш хоног',
      '4-өөс дээш хоног',
    ],
  },
  { key: 'swellingFever', text: 'Халуурч нүүр хавдсан уу?', type: 'bool' },
]

export default function QuestionnaireScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const params = useLocalSearchParams<{ childKey: string; classId: string; schoolId: string; seasonId: string; guardianPhone: string }>()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, boolean | string>>({})

  const q = QUESTIONS[step]
  const progress = (step + 1) / QUESTIONS.length

  const goToCamera = (finalAnswers: Record<string, boolean | string>) => {
    router.push({ pathname: '/scan/camera', params: { ...params, questionnaire: JSON.stringify(finalAnswers) } })
  }

  const answer = (value: boolean | string) => {
    const next = { ...answers, [q.key]: value }
    setAnswers(next)
    if (step === 0 && value === false) { goToCamera(next); return }
    if (step < QUESTIONS.length - 1) { setStep(s => s + 1) } else { goToCamera(next) }
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={[s.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[s.fill, { flex: progress, backgroundColor: colors.primary }]} />
        <View style={{ flex: 1 - progress }} />
      </View>
      <Text style={[s.stepLabel, { color: colors.textMuted }]}>{step + 1} / {QUESTIONS.length}</Text>
      <View style={[s.card, { backgroundColor: colors.surface }]}>
        <Text style={[s.question, { color: colors.textBase }]}>{q.text}</Text>
      </View>
      {q.type === 'bool' ? (
        <View style={s.boolRow}>
          <TouchableOpacity style={[s.yesBtn, { backgroundColor: colors.primary }]} onPress={() => answer(true)}>
            <Text style={[s.yesBtnText, { color: colors.primaryText }]}>Тийм</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.noBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => answer(false)}>
            <Text style={[s.noBtnText, { color: colors.textBase }]}>Үгүй</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.choiceList}>
          {q.choices?.map((choice) => (
            <TouchableOpacity key={choice} style={[s.choiceBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => answer(choice)}>
              <Text style={[s.choiceText, { color: colors.textBase }]}>{choice}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {step > 0 && (
        <TouchableOpacity style={s.backBtn} onPress={() => setStep(s => s - 1)}>
          <Text style={[s.backBtnText, { color: colors.textMuted }]}>← Буцах</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, padding: 20 },
  progressTrack: { flexDirection: 'row', height: 4, borderRadius: 2, marginBottom: 20, overflow: 'hidden' },
  fill: { borderRadius: 2 },
  stepLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'right', marginBottom: 10 },
  card: { borderRadius: 20, padding: 24, marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  question: { fontSize: 20, fontFamily: 'Inter_600SemiBold', lineHeight: 28 },
  boolRow: { gap: 12 },
  yesBtn: { borderRadius: 14, padding: 18, alignItems: 'center' },
  yesBtnText: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  noBtn: { borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1.5 },
  noBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
  choiceList: { gap: 10 },
  choiceBtn: { borderRadius: 14, padding: 16, borderWidth: 1.5 },
  choiceText: { fontSize: 16, fontFamily: 'Inter_500Medium' },
  backBtn: { marginTop: 24, alignItems: 'center' },
  backBtnText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
})
