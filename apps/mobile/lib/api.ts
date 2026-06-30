import type { ChildScreeningSummary, InferenceDetection, Quadrant, SymptomSet, UserRole, FollowUpStatus } from '@pinequest/types'
import { normalizeInference, detectionsToFindings, triage } from '@pinequest/core'
import { getToken, type AuthUser } from './auth'
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

export type ProfilePatch = { name?: string; phone?: string; email?: string }
export type ProfileResult = { id: string; name: string; email: string; role: string; phone: string | null; schoolId: string | null }
export type MeResult = {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  schoolId: string | null
  isActive: boolean
  /** The JWT's CURRENT (possibly switched) role — drives which UI to render. */
  activeRole?: UserRole
  /** True when this user also has a linked child → role-switcher is offered. */
  hasParentLink?: boolean
}

export const getMe = () => apiFetch<MeResult>('/api/auth/me')

/** Re-scope a dual-role user (e.g. a teacher who linked their own child) to
 *  `parent` and back. Returns a fresh token + user the caller must persist. */
export const switchRole = (role: 'parent' | 'self') =>
  apiFetch<{ token: string; user: AuthUser }>('/api/auth/switch-role', {
    method: 'POST',
    body: JSON.stringify({ role }),
  })

/** Scope-aware roster + each child's latest triage — the shared worklist source
 *  for every role: parent→own child, teacher→their classes, doctor→whole school. */
export type BoardStudent = {
  id: string
  childKey: string
  firstName: string
  lastName: string
  rosterSlot: number
  birthYear: number
  classId: string
  schoolId: string
  className: string
  seasonId: string
  guardianEmail: string | null
  guardianPhone: string | null
  latestLevel: TriageLevel | null
  latestScreeningId: string | null
  screenedAt: string | null
  followUpStatus: FollowUpStatus | null
  escalationFlag: boolean
  seasonCount: number
}

export const getBoardStudents = () => apiFetch<BoardStudent[]>('/api/board/students')

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

/** A student to append to an existing class — server assigns the roster slot. */
export type RosterAppendInput = Omit<RosterStudentInput, 'rosterSlot'>

export const addStudents = (classId: string, students: RosterAppendInput[]) =>
  apiFetch<{ added: number }>(`/api/teacher/classes/${classId}/students`, {
    method: 'POST',
    body: JSON.stringify({ students }),
  })

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

export type ScreeningFinding = {
  id: string
  fdi: number | null
  className: string
  confidence: number
  longitudinal: string | null
}

export type ScreeningQuestionnaire = {
  swelling: boolean | null
  painDisturbingSleepOrEating: boolean | null
  fever: boolean | null
  gumPimpleOrFistula: boolean | null
  trauma: boolean | null
  bleedingGums: boolean | null
}

export type ScreeningDetail = {
  id: string
  childKey: string
  childName: string | null
  childBirthYear: number | null
  classId: string
  className: string | null
  schoolId: string
  seasonId: string
  triageLevel: 'green' | 'yellow' | 'red'
  triageScore: number
  triageConfidentWording: boolean
  triageReason: string | null
  modelName: string
  modelVersion: string | null
  capturedAt: string
  findings: ScreeningFinding[]
  questionnaire: ScreeningQuestionnaire | null
  review: { confirmedLevel: string; note: string | null } | null
}

export const getScreening = (id: string) => apiFetch<ScreeningDetail>(`/api/screenings/${id}`)

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
  experienceYears: number | null
  licenseNo: string | null
  lat: number | null
  lng: number | null
  isAvailable: boolean
  phone: string | null
}

export const getVolunteerDentists = () =>
  apiFetch<VolunteerDentist[]>('/api/help/volunteers')

/** A booked video-call appointment with a volunteer dentist. The Jitsi room is
 *  derived from the row id server-side, so the payload carries no PII. */
export type Appointment = {
  id: string
  dentistId: string
  childKey: string
  schoolId: string | null
  level: 'red' | 'yellow'
  scheduledAt: string
  roomName: string
  roomUrl: string
  status: 'scheduled' | 'completed' | 'cancelled'
  createdById: string
  dentistNote: string | null
}

/** Book a video call with a volunteer dentist for a flagged child. Additive —
 *  one new appointment row per booking. */
export const createAppointment = (
  dentistId: string,
  childKey: string,
  scheduledAt: string,
  level: 'red' | 'yellow',
) =>
  apiFetch<Appointment>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify({ dentistId, childKey, scheduledAt, level }),
  })

/** Help requests, role-scoped server-side: a dentist sees open + assigned ones,
 *  a school doctor their school's, a parent/teacher their own. */
export type HelpRequestRow = {
  id: string
  childKey: string
  schoolId: string
  level: 'red' | 'yellow'
  note: string | null
  status: 'open' | 'connected' | 'closed'
  createdAt: string
  child: { firstName: string; lastName: string; guardianPhone: string | null; guardianEmail: string | null } | null
  dentist: { id: string; displayName: string; org: string | null } | null
}

export const getHelpRequests = () => apiFetch<HelpRequestRow[]>('/api/help/requests')

/** A dentist volunteer connects to (claims) an open help request. */
export const connectHelpRequest = (id: string) =>
  apiFetch<HelpRequest>(`/api/help/requests/${id}/connect`, { method: 'POST' })

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

/** One captured region (quadrant) tied to its own detections, for the result UI. */
export type PhotoAnalysis = {
  uri: string
  quadrant: Quadrant
  detections: InferenceDetection[]
}

/** A single captured photo + the region it represents, sent to inference. */
export type CaptureShot = { uri: string; quadrant: Quadrant }

export type AnalyzeResult = {
  screeningId: string
  triageLevel: 'green' | 'yellow' | 'red'
  triageScore: number
  detections: InferenceDetection[]
  /** Per-photo breakdown (present from analyzeImages), used to draw boxes on each image. */
  photos?: PhotoAnalysis[]
  /** Gemini-generated parent advice (server path only; absent on offline/local fallback). */
  advice?: string
  modelVersion?: string
}

const isOfflineError = (err: unknown): boolean =>
  err instanceof TypeError &&
  (err.message.includes('Network request failed') || err.message.includes('fetch'))

// Server-side inference failures (e.g. the inference URL/tunnel is down) that a
// cached on-device model can recover from. Unlike isOfflineError these come back
// as a real HTTP response, so the fetch itself succeeds but the worker reports
// the model was unreachable.
const INFERENCE_RECOVERABLE = new Set(['inference_failed', 'inference_unreachable', 'inference_not_configured'])

const canFallbackToLocal = (err: unknown): boolean =>
  isOfflineError(err) || (err instanceof Error && INFERENCE_RECOVERABLE.has(err.message))

/** Run every region locally (offline fallback), combining into ONE screening. */
const analyzeImagesLocally = async (
  shots: CaptureShot[],
  symptoms: SymptomSet = {},
): Promise<AnalyzeResult> => {
  const photos: PhotoAnalysis[] = []
  for (const i of shots) {
    const raw = await runLocalInference(i.uri)
    photos.push({ uri: i.uri, quadrant: i.quadrant, detections: normalizeInference(raw, 'on_device').detections })
  }
  const detections = photos.flatMap(p => p.detections)
  const findings = detectionsToFindings(detections, () => `local-${Math.random().toString(36).slice(2)}`)
  const triageResult = triage(findings, symptoms)
  return {
    screeningId: `local-${Date.now()}`,
    triageLevel: triageResult.level,
    triageScore: triageResult.score,
    detections,
    photos,
    modelVersion: process.env.EXPO_PUBLIC_MODEL_VERSION ?? 'on-device-v1',
  }
}

/**
 * Send all four region photos in ONE request so the server creates a SINGLE
 * screening that holds every finding. Sending them separately would split one
 * capture across multiple screening records, and the report would only ever read
 * one of them. Each photo is keyed by its quadrant (`image_<quadrant>`).
 */
export const analyzeImages = async (
  shots: CaptureShot[],
  meta: AnalyzeMeta,
): Promise<AnalyzeResult> => {
  const token = await getToken()
  const form = new FormData()
  for (const shot of shots) {
    form.append(
      `image_${shot.quadrant}`,
      { uri: shot.uri, type: 'image/jpeg', name: `${shot.quadrant}.jpg` } as unknown as Blob,
    )
  }
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
    // The server has no device-side image URIs; re-attach them by quadrant so the
    // result UI can render each photo with its own detection boxes.
    const uriByQuadrant = Object.fromEntries(shots.map(s => [s.quadrant, s.uri])) as Record<Quadrant, string>
    const photos = (json.data.photos ?? []).map(p => ({ ...p, uri: uriByQuadrant[p.quadrant] ?? p.uri }))
    return { ...json.data, photos }
  } catch (err) {
    if (canFallbackToLocal(err) && (await isModelCached())) {
      const sym = (() => { try { return JSON.parse(meta.symptoms ?? '{}') as SymptomSet } catch { return {} } })()
      return analyzeImagesLocally(shots, sym)
    }
    throw err
  }
}
