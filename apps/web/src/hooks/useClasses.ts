import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SchoolClass, SchoolClassRow } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export const useClass = (classId: string) => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['class', classId],
    queryFn: () => apiFetch<SchoolClass>(`/api/classes/${classId}`, { token }),
    enabled: !!token && !!classId,
  })
}

export const useClasses = (schoolId: string) => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => apiFetch<SchoolClassRow[]>(`/api/schools/${schoolId}/classes`, { token }),
    enabled: !!token && !!schoolId,
  })
}

export const useCreateClass = (schoolId: string) => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; seasonId: string; gradeLevel?: number }) =>
      apiFetch<SchoolClass>(`/api/schools/${schoolId}/classes`, { token, method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes', schoolId] }),
  })
}

type CarryVars = {
  classId: string
  newSeasonId: string
  newName?: string
  scheduledAt?: string | null
  reminderPhone?: string | null
}

export const useCarryForward = (schoolId: string) => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: CarryVars) =>
      apiFetch<SchoolClassRow>(`/api/classes/${vars.classId}/carry-forward`, {
        token,
        method: 'POST',
        body: {
          newSeasonId: vars.newSeasonId,
          newName: vars.newName,
          scheduledAt: vars.scheduledAt,
          reminderPhone: vars.reminderPhone,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes', schoolId] }),
  })
}

export const useScheduleClass = (schoolId: string) => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { classId: string; scheduledAt: string | null; reminderPhone: string | null }) =>
      apiFetch<SchoolClass>(`/api/classes/${vars.classId}/schedule`, {
        token,
        method: 'PATCH',
        body: { scheduledAt: vars.scheduledAt, reminderPhone: vars.reminderPhone },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes', schoolId] }),
  })
}
