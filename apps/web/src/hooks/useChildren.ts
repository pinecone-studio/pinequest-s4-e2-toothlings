import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Child, ChildScreeningSummary, DuplicateWarning, RosterImportRow } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export type ChildSummaryPayload = {
  child: {
    id: string
    firstName: string
    lastName: string
    birthYear: number
    gender: string | null
    guardianPhone: string | null
    guardianEmail: string | null
  }
  summary: ChildScreeningSummary | null
  screeningCount: number
}

export const useChildSummary = (id: string) => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['child-summary', id],
    queryFn: () => apiFetch<ChildSummaryPayload>(`/api/children/${id}/summary`, { token }),
    enabled: !!token && !!id,
  })
}

export const useChildren = (classId: string) => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['children', classId],
    queryFn: () => apiFetch<Child[]>(`/api/classes/${classId}/children`, { token }),
    enabled: !!token && !!classId,
  })
}

export const useChild = (id: string) => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['child', id],
    queryFn: () => apiFetch<Child>(`/api/children/${id}`, { token }),
    enabled: !!token && !!id,
  })
}

type BulkResult = { created: number; duplicates: DuplicateWarning[] }

export const useBulkImport = (classId: string) => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (rows: RosterImportRow[]) =>
      apiFetch<BulkResult>(`/api/classes/${classId}/children/bulk`, {
        token,
        method: 'POST',
        body: rows,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['children', classId] }),
  })
}
