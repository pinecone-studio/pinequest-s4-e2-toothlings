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

const analyzeImage = async (imageUri: string, meta: AnalyzeMeta): Promise<AnalyzeResult> => {
  const token = await getToken()
  const form = new FormData()
  form.append('image', { uri: imageUri, type: 'image/jpeg', name: 'capture.jpg' } as unknown as Blob)
  for (const [k, v] of Object.entries(meta)) {
    if (v) form.append(k, v)
  }
  const res = await fetch(`${BASE}/api/screenings/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token ?? ''}` },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: form as any,
  })
  const json = (await res.json()) as { success: boolean; data: AnalyzeResult; message?: string }
  if (!res.ok) throw new Error(json.message ?? String(res.status))
  return json.data
}

const LEVEL_RANK: Record<AnalyzeResult['triageLevel'], number> = { green: 0, yellow: 1, red: 2 }

export const analyzeImages = async (
  upperUri: string,
  lowerUri: string,
  meta: AnalyzeMeta,
): Promise<AnalyzeResult> => {
  const [upper, lower] = await Promise.allSettled([
    analyzeImage(upperUri, meta),
    analyzeImage(lowerUri, meta),
  ])

  const results: AnalyzeResult[] = [
    ...(upper.status === 'fulfilled' ? [upper.value] : []),
    ...(lower.status === 'fulfilled' ? [lower.value] : []),
  ]
  if (!results.length) {
    const err = upper.status === 'rejected' ? upper.reason : (lower as PromiseRejectedResult).reason
    throw new Error(err instanceof Error ? err.message : String(err))
  }

  const worst = results.reduce((a, b) => LEVEL_RANK[a.triageLevel] >= LEVEL_RANK[b.triageLevel] ? a : b)
  return {
    screeningId: worst.screeningId,
    triageLevel: worst.triageLevel,
    triageScore: Math.max(...results.map(r => r.triageScore)),
    detections: results.flatMap(r => r.detections),
  }
}
