import { useState, useRef } from 'react'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { useRouter } from 'expo-router'
import type { CameraView } from 'expo-camera'
import { analyzeImages } from './api'
import { toMongolian } from './errorMessages'
import { detectionsToFindings, TRIAGE_THRESHOLDS } from '@pinequest/core'
import type { SymptomSet } from '@pinequest/types'
import { outbox } from './useOutboxSync'
import { getUser } from './auth'

type Params = {
  childKey: string; classId: string; schoolId: string
  seasonId: string; questionnaire: string; guardianPhone: string; birthYear?: string
}
type Photos = { upper?: string; lower?: string }

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
  const [mode, setMode] = useState<'upper' | 'lower'>('upper')
  const [photos, setPhotos] = useState<Photos>({})
  const cameraRef = useRef<CameraView>(null)

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
      if (!newPhotos.upper || !newPhotos.lower) {
        setMode(m => m === 'upper' ? 'lower' : 'upper')
        setCapturing(false)
        return
      }
      setCapturing(false)
      setAnalyzing(true)

      const symptomsObj = parseSymptoms(params.questionnaire)
      const symptomsJson = JSON.stringify(symptomsObj)
      const capturedAt = new Date().toISOString()

      const result = await analyzeImages(newPhotos.upper, newPhotos.lower, {
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
          imageRefs: [newPhotos.upper, newPhotos.lower],
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
      setCapturing(false)
      setAnalyzing(false)
    }
  }

  return {
    cameraRef, mode, photos, analyzing, capturing, error,
    capture, toggleMode: () => setMode(m => m === 'upper' ? 'lower' : 'upper'),
  }
}
