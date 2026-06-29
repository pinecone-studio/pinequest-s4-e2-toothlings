import { getQuestionnaire, questionnaireSymptoms, type ScanDetection, type ScanResult } from '@/lib/consumerState'

type AnalyzePayload = {
  triage: ScanResult['triage']
  urgent: boolean
  needsDoctor: boolean
  detections: ScanDetection[]
  advice: string
}

export const analyzeScanImage = async (file: File, imageUrl: string): Promise<ScanResult> => {
  const q = getQuestionnaire()
  const form = new FormData()
  form.append('image', file)
  if (q) {
    form.append('hasPain', q.hasPainfulTooth === 'yes' ? 'yes' : 'no')
    const symptoms = questionnaireSymptoms(q)
    if (symptoms.painDisturbingSleepOrEating) form.append('nightPain', 'yes')
    if (symptoms.fever) form.append('fever', 'yes')
    if (symptoms.swelling) form.append('feverSwelling', 'yes')
  }

  const res = await fetch('/api/inference/analyze', { method: 'POST', body: form })
  const payload = (await res.json()) as AnalyzePayload | { message?: string }
  if (!res.ok) {
    throw new Error('message' in payload && payload.message ? payload.message : 'inference_failed')
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
    createdAt: new Date().toISOString(),
  }
}

export const scanErrorText = (message: string): string => {
  if (message.includes('inference_unreachable') || message.includes('inference_not_configured')) {
    return 'AI сервер түр ажиллахгүй байна — хэдэн секунд хүлээгээд дахин оролдоно уу.'
  }
  if (message === 'inference_failed') return 'AI шинжилгээ амжилтгүй — дахин оролдоно уу.'
  return 'AI шинжилгээнд алдаа гарлаа — дахин оролдоно уу.'
}
