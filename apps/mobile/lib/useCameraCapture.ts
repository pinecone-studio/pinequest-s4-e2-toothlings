import { useState, useRef } from 'react'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { useRouter } from 'expo-router'
import type { CameraView } from 'expo-camera'
import { analyzeImages } from './api'
import { toMongolian } from './errorMessages'
import { detectionsToFindings, QUADRANTS, TRIAGE_THRESHOLDS } from '@pinequest/core'
import type { Quadrant, SymptomSet } from '@pinequest/types'
import { outbox } from './useOutboxSync'
import { getUser } from './auth'

type Params = {
  childKey: string; classId: string; schoolId: string
  seasonId: string; questionnaire: string; guardianPhone: string; birthYear?: string
}
type Photos = Partial<Record<Quadrant, string>>
/** All four regions captured — ready to analyze. */
type ReadyPhotos = Record<Quadrant, string>

const compress = async (uri: string): Promise<string> => {
  const ctx = ImageManipulator.manipulate(uri)
  ctx.resize({ width: 640 })
  const ref = await ctx.renderAsync()
  const out = await ref.saveAsync({ compress: 0.8, format: SaveFormat.JPEG })
  return out.uri
}

const parseSymptoms = (questionnaire: string): SymptomSet => {
  try {
    const a = JSON.parse(questionnaire ?? '{}') as Record<string, unknown>
    const s: SymptomSet = {}
    if (a.swellingFever === true) { s.swelling = true; s.fever = true }
    if (a.toothPain === true && a.painTrigger === 'Шөнө өвддөг') s.painDisturbingSleepOrEating = true
    return s
  } catch { return {} }
}

export const useCameraCapture = (params: Params) => {
  const router = useRouter()
  const [analyzing, setAnalyzing] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<Quadrant>('upperRight')
  const [photos, setPhotos] = useState<Photos>({})
  const cameraRef = useRef<CameraView>(null)

  const runAnalysis = async (ready: ReadyPhotos) => {
    setError(null)
    setCapturing(false)
    setAnalyzing(true)
    try {
      const symptomsObj = parseSymptoms(params.questionnaire)
      const symptomsJson = JSON.stringify(symptomsObj)
      const capturedAt = new Date().toISOString()
      const shots = QUADRANTS.map(q => ({ uri: ready[q], quadrant: q }))

      const result = await analyzeImages(shots, {
        childKey: params.childKey, classId: params.classId,
        schoolId: params.schoolId, seasonId: params.seasonId,
        symptoms: symptomsJson,
      })

      if (result.screeningId.startsWith('local-')) {
        const user = await getUser()
        let fi = 0
        await outbox.add({
          id: result.screeningId,
          childKey: params.childKey, classId: params.classId,
          schoolId: params.schoolId, seasonId: params.seasonId,
          screenedById: user?.id ?? 'anonymous',
          imageRefs: QUADRANTS.map(q => ready[q]),
          findings: detectionsToFindings(result.detections, () => `${result.screeningId}-f${fi++}`),
          symptoms: symptomsObj,
          triage: {
            level: result.triageLevel, score: result.triageScore,
            confidentWording: result.detections.reduce((m, d) => Math.max(m, d.confidence), 0) >= TRIAGE_THRESHOLDS.confidentWording,
          },
          modelName: 'yolov8-local',
          modelVersion: result.modelVersion,
          capturedAt,
        }).catch(() => {})
      }

      router.replace({
        pathname: '/scan/result',
        params: {
          screeningId: result.screeningId, triageLevel: result.triageLevel,
          triageScore: String(result.triageScore),
          detectionsCount: String(result.detections.length),
          photos: JSON.stringify(result.photos ?? []),
          advice: result.advice ?? '',
          guardianPhone: params.guardianPhone ?? '',
          childKey: params.childKey, classId: params.classId,
          schoolId: params.schoolId, seasonId: params.seasonId,
          questionnaire: params.questionnaire,
          birthYear: params.birthYear ?? '',
          symptoms: symptomsJson, capturedAt,
        },
      })
    } catch (err) {
      console.error('[camera] failed:', err instanceof Error ? err.message : String(err))
      setError(toMongolian(err))
      setAnalyzing(false)
    }
  }

  const capture = async () => {
    if (!cameraRef.current || analyzing || capturing) return
    setError(null)
    setCapturing(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 })
      if (!photo) throw new Error('Зураг авах амжилтгүй')
      const uri = await compress(photo.uri)
      const newPhotos: Photos = { ...photos, [mode]: uri }
      setPhotos(newPhotos)
      // Advance to the next region still missing a photo; analyze once all four are in.
      const nextPending = QUADRANTS.find(q => !newPhotos[q])
      if (nextPending) {
        setMode(nextPending)
        setCapturing(false)
        return
      }
      await runAnalysis(newPhotos as ReadyPhotos)
    } catch (err) {
      console.error('[camera] failed:', err instanceof Error ? err.message : String(err))
      setError(toMongolian(err))
      setCapturing(false)
      setAnalyzing(false)
    }
  }

  // Re-run analysis on the already-captured photos (no re-capture needed).
  const retry = async () => {
    if (analyzing || capturing || !QUADRANTS.every(q => photos[q])) return
    await runAnalysis(photos as ReadyPhotos)
  }

  return {
    cameraRef, mode, photos, analyzing, capturing, error,
    capture, retry,
    toggleMode: () => setMode(m => QUADRANTS[(QUADRANTS.indexOf(m) + 1) % QUADRANTS.length]),
  }
}
