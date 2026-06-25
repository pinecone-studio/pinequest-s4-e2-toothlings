import { useQuery } from '@tanstack/react-query'
import { apiStatFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export type DashStats = {
  totalScreened: number
  triage: { green: number; yellow: number; red: number }
  coverage: { screened: number; total: number }
  pendingReview: number
  flaggedFollowUps: number
  resolvedFollowUps: number
}

export const useStats = (opts: { seasonId?: string; schoolId?: string } = {}) => {
  const { token } = useSession()
  const qs = new URLSearchParams(
    Object.entries(opts).filter(([, v]) => Boolean(v)) as [string, string][],
  ).toString()
  return useQuery({
    queryKey: ['stats', opts],
    queryFn: () => apiStatFetch<DashStats>(`/api/stats${qs ? `?${qs}` : ''}`, { token, revalidate: 120 }),
    enabled: !!token,
  })
}
