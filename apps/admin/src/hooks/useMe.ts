import { useQuery } from '@tanstack/react-query'
import type { UserRole } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export type Me = { id: string; name: string; email: string; role: UserRole }

export const useMe = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<Me>('/api/auth/me', { token }),
    enabled: !!token,
  })
}
