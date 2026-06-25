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

type Filters = { childKey?: string; classId?: string; schoolId?: string; seasonId?: string; limit?: number }

export const useScreenings = (filters: Filters) => {
  const { token } = useSession()
  const qs = new URLSearchParams(
    Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  ).toString()
  return useQuery({
    queryKey: ['screenings', filters],
    queryFn: () => apiFetch<ScreeningRow[]>(`/api/screenings${qs ? `?${qs}` : ''}`, { token }),
    enabled: !!token,
  })
}
