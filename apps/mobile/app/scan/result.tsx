import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'
import ResultTriageCard, { TriageLevel } from '@/components/scan/result/ResultTriageCard'
import ResultToothGrid from '@/components/scan/result/ResultToothGrid'
import ResultGreenAdvice from '@/components/scan/result/ResultGreenAdvice'
import ResultYellowAdvice from '@/components/scan/result/ResultYellowAdvice'
import ResultRedAdvice from '@/components/scan/result/ResultRedAdvice'
import ResultDisclaimer from '@/components/scan/result/ResultDisclaimer'
import ResultBottomActions from '@/components/scan/result/ResultBottomActions'

export default function ResultScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const params = useLocalSearchParams<{
    triageLevel: string
    triageScore: string
    detectionsCount: string
    screeningId: string
    guardianPhone: string
    childKey: string
    classId: string
    schoolId: string
    seasonId: string
    questionnaire: string
  }>()

  const level = (params.triageLevel ?? 'green') as TriageLevel
  const score = Number(params.triageScore ?? '0')
  const detectionsCount = Number(params.detectionsCount ?? '0')
  const screeningId = params.screeningId ?? ''

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <ResultTriageCard level={level} score={score} />
        <ResultDisclaimer />
        <ResultToothGrid level={level} detectionsCount={detectionsCount} />
        {level === 'green' && <ResultGreenAdvice />}
        {level === 'yellow' && <ResultYellowAdvice />}
        {level === 'red' && <ResultRedAdvice guardianPhone={params.guardianPhone} />}
        <ResultBottomActions
          screeningId={screeningId}
          onRetake={() => router.replace({
            pathname: '/scan/camera',
            params: {
              childKey: params.childKey,
              classId: params.classId,
              schoolId: params.schoolId,
              seasonId: params.seasonId,
              questionnaire: params.questionnaire,
              guardianPhone: params.guardianPhone,
            },
          })}
          onHome={() => router.replace('/(tabs)')}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
})
