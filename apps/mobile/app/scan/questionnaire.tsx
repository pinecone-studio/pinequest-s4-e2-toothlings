import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'

type Q = { key: string; text: string; type: 'bool' | 'choice'; choices?: string[] }

const CHILD_QS: Q[] = [
  { key: 'swelling', text: 'Аман хөндийд хавдар байна уу?', type: 'bool' },
  { key: 'painDisturbingSleepOrEating', text: 'Шүдний өвдөлт унтах эсвэл идэхэд саад болж байна уу?', type: 'bool' },
  { key: 'fever', text: 'Халуурал байна уу?', type: 'bool' },
  { key: 'gumPimpleOrFistula', text: 'Буйлан дээр бойр эсвэл ялтас байна уу?', type: 'bool' },
  { key: 'trauma', text: 'Шүдэнд гэмтэл болсон уу?', type: 'bool' },
]

const ADULT_QS: Q[] = [
  { key: 'swelling', text: 'Аман хөндийд хавдар байна уу?', type: 'bool' },
  { key: 'painDisturbingSleepOrEating', text: 'Шүдэнд өвдөлт эсвэл хүйтэн/халуунд мэдрэмтгий байдал байна уу?', type: 'bool' },
  { key: 'bleedingGums', text: 'Шүдэндээ хялмаас арилгахад буйлнаас цус гардаг уу?', type: 'bool' },
  { key: 'lastCheckupAdult', text: 'Сүүлд шүдний эмчид хэзээ үзүүлсэн бэ?', type: 'choice', choices: ['Хэзээ ч үзүүлж байгаагүй', '1 жилийн дотор', '1-ээс дээш жилийн өмнө'] },
  { key: 'smoker', text: 'Тамхи татдаг уу?', type: 'bool' },
]

export default function QuestionnaireScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const params = useLocalSearchParams<{ childKey: string; classId: string; schoolId: string; seasonId: string; isAdult: string; guardianPhone: string }>()

  const isAdult = params.isAdult === 'true'
  const questions = isAdult ? ADULT_QS : CHILD_QS
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, boolean | string>>({})

  const q = questions[step]
  const progress = step / questions.length

  const answer = (value: boolean | string) => {
    const next = { ...answers, [q.key]: value, isAdult }
    setAnswers(next)
    if (step < questions.length - 1) {
      setStep(s => s + 1)
    } else {
      router.push({ pathname: '/scan/camera', params: { ...params, questionnaire: JSON.stringify(next) } })
    }
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={[s.progressTrack, { backgroundColor: colors.border }]}>
        <View style={{ flex: progress, backgroundColor: colors.primary, height: 4, borderRadius: 2 }} />
        <View style={{ flex: 1 - progress }} />
      </View>

      <Text style={[s.stepLabel, { color: colors.textMuted }]}>{step + 1} / {questions.length}</Text>

      <View style={[s.card, { backgroundColor: colors.surface }]}>
        <Text style={[s.question, { color: colors.textBase }]}>{q.text}</Text>
      </View>

      {q.type === 'bool' ? (
        <View style={s.boolRow}>
          <TouchableOpacity style={[s.yesBtn, { backgroundColor: colors.primary }]} onPress={() => answer(true)}>
            <Text style={s.yesBtnText}>Тийм</Text>
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
  stepLabel: { fontSize: 13, textAlign: 'right', marginBottom: 10 },
  card: { borderRadius: 20, padding: 24, marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  question: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  boolRow: { gap: 12 },
  yesBtn: { borderRadius: 14, padding: 18, alignItems: 'center' },
  yesBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  noBtn: { borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1.5 },
  noBtnText: { fontWeight: '600', fontSize: 17 },
  choiceList: { gap: 10 },
  choiceBtn: { borderRadius: 14, padding: 16, borderWidth: 1.5 },
  choiceText: { fontSize: 16, fontWeight: '500' },
  backBtn: { marginTop: 24, alignItems: 'center' },
  backBtnText: { fontSize: 15 },
})
