import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserRole } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export type UserRow = {
  id: string
  name: string
  email: string
  role: UserRole
  schoolId: string | null
  isActive: boolean
  createdAt: string
}

export const useUsers = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<UserRow[]>('/api/users', { token }),
    enabled: !!token,
  })
}

export const useCreateUser = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; email: string; password: string; role: UserRole; schoolId?: string }) =>
      apiFetch<UserRow>('/api/users', { token, method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export const usePatchUser = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; role?: UserRole; isActive?: boolean; schoolId?: string | null }) => {
      const { id, ...body } = vars
      return apiFetch<UserRow>(`/api/users/${id}`, { token, method: 'PATCH', body })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}
