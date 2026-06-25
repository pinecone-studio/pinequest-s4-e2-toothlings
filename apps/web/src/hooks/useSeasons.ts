import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

/** Distinct seasons (newest first) the current user is scoped to see. */
export const useSeasons = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['seasons'],
    queryFn: () => apiFetch<string[]>('/api/seasons', { token }),
    enabled: !!token,
  })
}
