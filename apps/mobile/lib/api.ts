import type { ChildScreeningSummary, InferenceDetection, SymptomSet } from '@pinequest/types'
import { normalizeInference, detectionsToFindings, triage } from '@pinequest/core'
import { getToken } from './auth'
import { runLocalInference, isModelCached } from './localInference'

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

export type TriageLevel = 'green' | 'yellow' | 'red'

export type TeacherClass = {
  id: string
  schoolId: string
  name: string
  seasonId: string
  gradeLevel: number | null
  scheduledAt: string | null
  reminderPhone: string | null
  isActive: boolean
  createdAt: string
  enrolled: number
  screened: number
}

export type RosterStatusRow = {
  id: string
  childKey: string
  rosterSlot: number
  firstName: string
  lastName: string
  birthYear: number
  guardianEmail: string | null
  guardianPhone: string | null
  latestLevel: TriageLevel | null
  screenedAt: string | null
}

export type RosterStudentInput = {
  rosterSlot: number
  firstName: string
  lastName: string
  birthYear: number
  gender?: 'M' | 'F'
  guardianPhone?: string
  guardianEmail?: string
}

export type CreateClassPayload = {
  name: string
  seasonId: string
  gradeLevel?: number
  scheduledAt?: string
  reminderPhone?: string
  students: RosterStudentInput[]
}

export type ProfilePatch = { name?: string; phone?: string }
export type ProfileResult = { id: string; name: string; role: string; phone: string | null; schoolId: string | null }
export type MeResult = { id: string; email: string; name: string; role: string; phone: string | null; schoolId: string | null; isActive: boolean }

export const getMe = () => apiFetch<MeResult>('/api/auth/me')

export type ChildSummaryPayload = {
  child: { id: string; firstName: string; lastName: string; guardianPhone: string | null; guardianEmail: string | null }
  summary: ChildScreeningSummary | null
  screeningCount: number
}

export const getChildSummary = (childId: string) =>
  apiFetch<ChildSummaryPayload>(`/api/children/${childId}/summary`)

export type Stats = {
  totalScreened: number
  triage: { green: number; yellow: number; red: number }
  coverage: { screened: number; total: number }
  pendingReview: number
  flaggedFollowUps: number
  resolvedFollowUps: number
}
export type TimeseriesBucket = { ts: string; screened: number; flagged: number }
export type Timeseries = { range: 'D' | 'W' | 'M' | 'Y'; buckets: TimeseriesBucket[] }

const qs = (params: Record<string, string | undefined>) => {
  const p = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
  return p.length ? `?${p.join('&')}` : ''
}

export const getStats = (seasonId?: string) => apiFetch<Stats>(`/api/stats${qs({ seasonId })}`)
export const getTimeseries = (range: 'D' | 'W' | 'M' | 'Y', seasonId?: string) =>
  apiFetch<Timeseries>(`/api/stats/timeseries${qs({ range, seasonId })}`)
export const getSeasons = () => apiFetch<string[]>('/api/seasons')

export type ClassMeta = {
  id: string
  schoolId: string
  name: string
  seasonId: string
  gradeLevel: number | null
  scheduledAt: string | null
  reminderPhone: string | null
}

export const getMyClasses = () => apiFetch<TeacherClass[]>('/api/teacher/classes')

export const getClass = (id: string) => apiFetch<ClassMeta>(`/api/classes/${id}`)

export const createClass = (payload: CreateClassPayload) =>
  apiFetch<TeacherClass>('/api/teacher/classes', { method: 'POST', body: JSON.stringify(payload) })

export const getRosterStatus = (classId: string) =>
  apiFetch<RosterStatusRow[]>(`/api/teacher/classes/${classId}/roster-status`)

export const updateSchedule = (classId: string, scheduledAt: string | null, reminderPhone?: string | null) =>
  apiFetch<TeacherClass>(`/api/classes/${classId}/schedule`, {
    method: 'PATCH',
    body: JSON.stringify({ scheduledAt, reminderPhone }),
  })

export const updateMe = (patch: ProfilePatch) =>
  apiFetch<ProfileResult>('/api/auth/me', { method: 'PATCH', body: JSON.stringify(patch) })

export type ScreeningListItem = {
  id: string
  triageLevel: 'green' | 'yellow' | 'red'
  capturedAt: number
  classId: string
}

export const getMyScreenings = (userId: string) =>
  apiFetch<ScreeningListItem[]>(`/api/screenings?screenedById=${encodeURIComponent(userId)}`)

export type HelpRequest = { id: string; status: 'open' | 'connected' | 'closed' }

/** Ask a registered volunteer dentist to help a flagged (red/yellow) child. */
export const requestVolunteerHelp = (childKey: string, level: 'red' | 'yellow', note?: string) =>
  apiFetch<HelpRequest>('/api/help/requests', { method: 'POST', body: JSON.stringify({ childKey, level, note }) })

export type VolunteerDentist = {
  id: string
  userId: string
  displayName: string
  specialty: string | null
  org: string | null
  area: string | null
  avatarUrl: string | null
  lat: number | null
  lng: number | null
  isAvailable: boolean
  phone: string | null
}

export const getVolunteerDentists = () =>
  apiFetch<VolunteerDentist[]>('/api/help/volunteers')

export type AnalyzeMeta = {
  childKey: string
  classId: string
  schoolId: string
  seasonId: string
  contentVersionId?: string
  deviceId?: string
  /** JSON-serialized SymptomSet — mapped from raw questionnaire answers before the call. */
  symptoms?: string
}

/** One captured arch (upper/lower) tied to its own detections, for the result UI. */
export type PhotoAnalysis = {
  uri: string
  arch: 'upper' | 'lower'
  detections: InferenceDetection[]
}

export type AnalyzeResult = {
  screeningId: string
  triageLevel: 'green' | 'yellow' | 'red'
  triageScore: number
  detections: InferenceDetection[]
  /** Per-photo breakdown (present from analyzeImages), used to draw boxes on each image. */
  photos?: PhotoAnalysis[]
  modelVersion?: string
}

const isOfflineError = (err: unknown): boolean =>
  err instanceof TypeError &&
  (err.message.includes('Network request failed') || err.message.includes('fetch'))

const analyzeImageLocally = async (imageUri: string, symptoms: SymptomSet = {}): Promise<AnalyzeResult> => {
  const raw = await runLocalInference(imageUri)
  const normalized = normalizeInference(raw, 'on_device')
  const findings = detectionsToFindings(normalized.detections, () => `local-${Math.random().toString(36).slice(2)}`)
  const triageResult = triage(findings, symptoms)
  return {
    screeningId: `local-${Date.now()}`,
    triageLevel: triageResult.level,
    triageScore: triageResult.score,
    detections: normalized.detections,
    modelVersion: process.env.EXPO_PUBLIC_MODEL_VERSION ?? 'on-device-v1',
  }
}

const analyzeImage = async (imageUri: string, meta: AnalyzeMeta): Promise<AnalyzeResult> => {
  const token = await getToken()
  const form = new FormData()
  form.append('image', { uri: imageUri, type: 'image/jpeg', name: 'capture.jpg' } as unknown as Blob)
  for (const [k, v] of Object.entries(meta)) {
    if (v) form.append(k, v)
  }
  try {
    const res = await fetch(`${BASE}/api/screenings/analyze`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token ?? ''}` },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: form as any,
    })
    const json = (await res.json()) as { success: boolean; data: AnalyzeResult; message?: string }
    if (!res.ok) throw new Error(json.message ?? String(res.status))
    return json.data
  } catch (err) {
    if (isOfflineError(err) && (await isModelCached())) {
      const sym = (() => { try { return JSON.parse(meta.symptoms ?? '{}') as SymptomSet } catch { return {} } })()
      return analyzeImageLocally(imageUri, sym)
    }
    throw err
  }
}

const LEVEL_RANK: Record<AnalyzeResult['triageLevel'], number> = { green: 0, yellow: 1, red: 2 }

export const analyzeImages = async (
  upperUri: string,
  lowerUri: string,
  meta: AnalyzeMeta,
): Promise<AnalyzeResult> => {
  const inputs = [
    { uri: upperUri, arch: 'upper' as const },
    { uri: lowerUri, arch: 'lower' as const },
  ]
  const settled = await Promise.allSettled(inputs.map(i => analyzeImage(i.uri, meta)))

  const results: AnalyzeResult[] = []
  const photos: PhotoAnalysis[] = []
  settled.forEach((outcome, i) => {
    if (outcome.status === 'fulfilled') {
      results.push(outcome.value)
      photos.push({ uri: inputs[i].uri, arch: inputs[i].arch, detections: outcome.value.detections })
    }
  })

  if (!results.length) {
    const rejected = settled.find(s => s.status === 'rejected') as PromiseRejectedResult
    const err = rejected.reason
    throw new Error(err instanceof Error ? err.message : String(err))
  }

  const worst = results.reduce((a, b) => LEVEL_RANK[a.triageLevel] >= LEVEL_RANK[b.triageLevel] ? a : b)
  return {
    screeningId: worst.screeningId,
    triageLevel: worst.triageLevel,
    triageScore: Math.max(...results.map(r => r.triageScore)),
    detections: results.flatMap(r => r.detections),
    photos,
  }
}
