import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TriageLevel, FollowUpStatus, ChildTrendSnapshot } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { openParentEmail } from '@/lib/parentEmail'
import { useSession } from '@/components/providers'
import { useToast } from '@/components/ui/Toast'
import type { ChildSummaryPayload } from './useChildSummary'

export type SeasonSnapshot = {
  seasonId: string
  screeningId: string
  triageLevel: TriageLevel
  confirmedLevel: TriageLevel | null
  effectiveLevel: TriageLevel
  screenedAt: string
}

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
  seasonHistory: SeasonSnapshot[]
  seasonCount: number
  trend: ChildTrendSnapshot | null
}

/** Scope-aware roster + each child's latest triage status (admin/doctor/teacher/parent). */
export const useBoardStudents = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['board-students'],
    queryFn: () => apiFetch<BoardStudent[]>('/api/board/students', { token }),
    enabled: !!token,
    staleTime: 60_000,
  })
}

export type FollowUpUpdateVars = {
  childKey: string
  status: FollowUpStatus
  appointmentAt?: string | null
  notificationChannel?: 'sms' | 'call' | 'in_person' | null
  notes?: string | null
}

export const useSetFollowUpStatus = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ childKey, status, appointmentAt, notificationChannel, notes }: FollowUpUpdateVars) =>
      apiFetch(`/api/board/students/${childKey}/followup`, {
        token, method: 'PATCH',
        body: {
          status,
          ...(appointmentAt !== undefined && { appointmentAt }),
          ...(notificationChannel !== undefined && { notificationChannel }),
          ...(notes !== undefined && { notes }),
        },
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['board-students'] }); toast.success('Төлөв шинэчлэгдлээ') },
    onError: () => toast.error('Алдаа гарлаа — дахин оролдоно уу'),
  })
}

export const useUpdateChild = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (vars: { id: string; firstName?: string; lastName?: string; guardianPhone?: string; guardianEmail?: string }) => {
      const { id, ...body } = vars
      return apiFetch(`/api/children/${id}`, { token, method: 'PUT', body })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['board-students'] }); toast.success('Мэдээлэл шинэчлэгдлээ') },
    onError: () => toast.error('Алдаа гарлаа'),
  })
}

export const useDeleteChild = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/children/${id}`, { token, method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['board-students'] }); toast.success('Устгагдлаа') },
    onError: () => toast.error('Устгахад алдаа гарлаа'),
  })
}

/** Fetch a child's hedged summary, then open the parent email (mailto, no server send). */
export const useSendToParent = () => {
  const { token } = useSession()
  return async (s: BoardStudent) => {
    const payload = await apiFetch<ChildSummaryPayload>(`/api/children/${s.id}/summary`, { token })
    if (payload.summary) openParentEmail(`${s.lastName} ${s.firstName}`, s.guardianEmail, payload.summary, payload.hospital)
  }
}
