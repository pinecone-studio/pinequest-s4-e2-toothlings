import { getQuestionnaire, type ScanDetection, type ScanResult } from '@/lib/consumerState'

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
  if (q?.hasPain) form.append('hasPain', q.hasPain)

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
  if (message.includes('inference_unreachable')) {
    return 'AI сервер ажиллахгүй байна — өөр терминал дээр `pnpm dev:model` ажиллуулна уу.'
  }
  if (message === 'inference_failed') return 'AI шинжилгээ амжилтгүй — дахин оролдоно уу.'
  return 'AI шинжилгээнд алдаа гарлаа — дахин оролдоно уу.'
}
