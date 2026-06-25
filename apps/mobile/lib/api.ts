import { getToken } from './auth'

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://screener-api.ariunzul.workers.dev'

const authHeader = async (): Promise<Record<string, string>> => {
  const token = await getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const apiFetch = async <T>(path: string, opts?: RequestInit): Promise<T> => {
  const extra = await authHeader()
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...extra,
      ...(opts?.headers as Record<string, string> | undefined),
    },
  })
  const json = (await res.json()) as { success: boolean; data: T; message?: string }
  if (!res.ok) throw new Error(json.message ?? String(res.status))
  return json.data
}

export type AnalyzeMeta = {
  childKey: string
  classId: string
  schoolId: string
  seasonId: string
  contentVersionId?: string
  deviceId?: string
  questionnaire?: string // JSON-serialized questionnaire answers
}

export type AnalyzeResult = {
  screeningId: string
  triageLevel: 'green' | 'yellow' | 'red'
  triageScore: number
  detections: unknown[]
}

export const analyzeImage = async (imageUri: string, meta: AnalyzeMeta): Promise<AnalyzeResult> => {
  const token = await getToken()
  const form = new FormData()
  form.append('image', { uri: imageUri, type: 'image/jpeg', name: 'capture.jpg' } as unknown as Blob)
  for (const [k, v] of Object.entries(meta)) {
    if (v) form.append(k, v)
  }
  const res = await fetch(`${BASE}/api/screenings/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token ?? ''}` },
    body: form,
  })
  const json = (await res.json()) as { success: boolean; data: AnalyzeResult; message?: string }
  if (!res.ok) throw new Error(json.message ?? String(res.status))
  return json.data
}
