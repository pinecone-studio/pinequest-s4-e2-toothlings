import { useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'
import type { PhotoAnalysis } from '@/lib/api'
import { buildChildSummary, detectionsToFindings } from '@pinequest/core'
import type { SymptomSet } from '@pinequest/types'
import ResultTriageCard, { TriageLevel } from '@/components/scan/result/ResultTriageCard'
import ResultPhotoCard from '@/components/scan/result/ResultPhotoCard'
import ResultDetectionList from '@/components/scan/result/ResultDetectionList'
import ResultSummary from '@/components/scan/result/ResultSummary'
import ResultYellowAdvice from '@/components/scan/result/ResultYellowAdvice'
import ResultRedAdvice from '@/components/scan/result/ResultRedAdvice'
import ResultDisclaimer from '@/components/scan/result/ResultDisclaimer'
import ResultLongitudinalCard from '@/components/scan/result/ResultLongitudinalCard'
import ResultBottomActions from '@/components/scan/result/ResultBottomActions'
import { usePriorLevel } from '@/lib/usePriorLevel'

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
    photos: string
    birthYear?: string
    symptoms?: string
    capturedAt?: string
    advice?: string
  }>()

  const priorLevel = usePriorLevel(params.childKey ?? '')
  const level = (params.triageLevel ?? 'green') as TriageLevel
  const score = Number(params.triageScore ?? '0')
  const screeningId = params.screeningId ?? ''
  const birthYear = parseInt(params.birthYear ?? '0', 10)
  const capturedAt = params.capturedAt ?? new Date().toISOString()
  // Gemini-generated дүгнэлт (server path). Offline/local fallback үед хоосон —
  // тэр үед ResultSummary deterministic buildChildSummary рүү буцна.
  const advice = params.advice?.trim() || null

  const photos = useMemo<PhotoAnalysis[]>(() => {
    try {
      const parsed = JSON.parse(params.photos ?? '[]')
      return Array.isArray(parsed) ? (parsed as PhotoAnalysis[]) : []
    } catch {
      return []
    }
  }, [params.photos])

  const allDetections = useMemo(() => photos.flatMap(p => p.detections), [photos])

  const symptoms = useMemo<SymptomSet>(() => {
    try { return JSON.parse(params.symptoms ?? '{}') as SymptomSet }
    catch { return {} }
  }, [params.symptoms])

  const summary = useMemo(() => {
    if (!birthYear) return null
    let i = 0
    const findings = detectionsToFindings(allDetections, () => `rs-${screeningId}-${i++}`)
    const maxConf = allDetections.reduce((m, d) => Math.max(m, d.confidence), 0)
    return buildChildSummary({
      screeningId,
      seasonId: params.seasonId ?? '',
      capturedAt,
      birthYear,
      findings,
      symptoms,
      aiLevel: level,
      confidentWording: maxConf >= 0.6,
    })
  }, [birthYear, allDetections, screeningId, params.seasonId, capturedAt, symptoms, level])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[s.root, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <ResultTriageCard level={level} score={score} />
        <ResultDisclaimer />
        {priorLevel && <ResultLongitudinalCard currentLevel={level} priorLevel={priorLevel} />}
        <View style={s.photoGrid}>
          {photos.map((photo, i) => (
            <View key={`${photo.quadrant}-${i}`} style={s.photoCell}>
              <ResultPhotoCard photo={photo} />
            </View>
          ))}
        </View>
        <ResultDetectionList detections={allDetections} />
        <ResultSummary summary={summary} level={level} advice={advice} />
        {level === 'yellow' && <ResultYellowAdvice />}
        {level === 'red' && <ResultRedAdvice guardianPhone={params.guardianPhone} childKey={params.childKey} />}
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
              birthYear: params.birthYear ?? '',
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
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  // Two cards per row (2×2 grid for the four region photos).
  photoCell: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row' },
})
