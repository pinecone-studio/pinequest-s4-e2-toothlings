import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SchoolClass } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export const useClasses = (schoolId: string) => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => apiFetch<SchoolClass[]>(`/api/schools/${schoolId}/classes`, { token }),
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

export const useCarryForward = (schoolId: string) => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { classId: string; newSeasonId: string; newName?: string }) =>
      apiFetch<SchoolClass>(`/api/classes/${vars.classId}/carry-forward`, {
        token,
        method: 'POST',
        body: { newSeasonId: vars.newSeasonId, newName: vars.newName },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes', schoolId] }),
  })
}
