import type { ToothFinding } from '@pinequest/types'
import {
  getQuestionnaire,
  questionnaireSymptoms,
  type ScanDetection,
  type ScanGuidance,
  type ScanResult,
} from '@/lib/consumerState'

type AnalyzePayload = {
  triage: ScanResult['triage']
  urgent: boolean
  needsDoctor: boolean
  detections: ScanDetection[]
  advice: string
  guidance?: ScanGuidance
  findings?: ToothFinding[]
  triageScore?: number
  confidentWording?: boolean
}

type AnalyzeErrorPayload = {
  message?: string
  details?: string
}

export const analyzeScanImage = async (file: File, imageUrl: string, age?: string): Promise<ScanResult> => {
  const q = getQuestionnaire()
  const form = new FormData()
  form.append('image', file)
  if (q) {
    const appendIfPresent = (key: string, value?: string) => {
      if (value && value.trim()) form.append(key, value.trim())
    }

    appendIfPresent('childName', q.childName)
    appendIfPresent('age', q.age)
    appendIfPresent('lastDentalVisit', q.lastDentalVisit)
    form.append('hasPainfulTooth', q.hasPainfulTooth)
    appendIfPresent('painWhen', q.painWhen)
    appendIfPresent('painSince', q.painSince)
    form.append('feverSwelling', q.feverSwelling ?? 'no')
    appendIfPresent('filledAt', q.filledAt)

    form.append('hasPain', q.hasPainfulTooth === 'yes' ? 'yes' : 'no')
    const symptoms = questionnaireSymptoms(q)
    if (symptoms.painDisturbingSleepOrEating) form.append('nightPain', 'yes')
    if (symptoms.fever) form.append('fever', 'yes')
    if (symptoms.swelling) form.append('feverSwelling', 'yes')
  }

  // Web дээр асуумж байхгүй — сонгосон хүүхдийн нас (ростероос) AI зөвлөмжийн цорын ганц
  // контекст. Асуумжийн насыг (хэрэв байвал) дарж бичнэ.
  if (age && age.trim()) form.set('age', age.trim())

  const res = await fetch('/api/inference/analyze', { method: 'POST', body: form })
  const payload = (await res.json().catch(() => ({}))) as AnalyzePayload | AnalyzeErrorPayload
  if (!res.ok) {
    const message = 'message' in payload && payload.message ? payload.message : 'inference_failed'
    const details = 'details' in payload && payload.details ? `: ${payload.details}` : ''
    throw new Error(`${message}${details}`)
  }

  const data = payload as AnalyzePayload
  return {
    id: `scan-${Date.now()}`,
    imageUrl,
    triage: data.triage,
    urgent: data.urgent,
    needsDoctor: data.needsDoctor,
    detections: data.detections,
    advice: data.advice,
    guidance: data.guidance,
    findings: data.findings,
    triageScore: data.triageScore,
    confidentWording: data.confidentWording,
    createdAt: new Date().toISOString(),
  }
}

export const scanErrorText = (message: string): string => {
  const lower = message.toLowerCase()
  if (lower.includes('missing_gemini_key')) {
    return 'Gemini API түлхүүр олдсонгүй — env файлд GEMINI_API_KEY-ээ шалгана уу.'
  }
  if (lower.includes('gemini_parse_error') || lower.includes('gemini_failed')) {
    return 'Gemini-аас хариу буцаагүй. Зураг тодорхой, жижиг хэмжээтэй эсэхийг шалгаад дахин оролдоно уу.'
  }
  if (lower.includes('inference_unreachable') || lower.includes('inference_not_configured')) {
    return 'AI сервер түр ажиллахгүй байна — хэдэн секунд хүлээгээд дахин оролдоно уу.'
  }
  if (message === 'inference_failed') return 'AI шинжилгээ амжилтгүй — дахин оролдоно уу.'
  return 'AI шинжилгээнд алдаа гарлаа — дахин оролдоно уу.'
}
