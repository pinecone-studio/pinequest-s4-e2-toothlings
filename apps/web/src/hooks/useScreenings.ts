import { useQuery } from '@tanstack/react-query'
import type { TriageLevel } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export type ScreeningRow = {
  id: string
  childKey: string
  seasonId: string
  triageLevel: TriageLevel
  triageReason: string | null
  capturedAt: string
  findings: { id: string }[]
}

type Filters = { childKey?: string; classId?: string; schoolId?: string; seasonId?: string }

export const useScreenings = (filters: Filters) => {
  const { token } = useSession()
  const qs = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => Boolean(v)) as [string, string][],
  ).toString()
  const hasFilter = qs.length > 0
  return useQuery({
    queryKey: ['screenings', filters],
    queryFn: () => apiFetch<ScreeningRow[]>(`/api/screenings?${qs}`, { token }),
    enabled: !!token && hasFilter,
  })
}
