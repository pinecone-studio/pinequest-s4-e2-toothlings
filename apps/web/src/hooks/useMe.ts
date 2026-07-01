import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserRole } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { setToken } from '@/lib/auth'
import { useSession } from '@/components/providers'
import { useToast } from '@/components/ui/Toast'

export type Me = {
  id: string; name: string; email: string; role: UserRole; phone: string | null
  /** The JWT's current (possibly switched) role. */
  activeRole?: UserRole
  /** True if this user also linked their own child → can switch to a parent view. */
  hasParentLink?: boolean
}

export const useMe = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<Me>('/api/auth/me', { token }),
    enabled: !!token,
  })
}

/** Re-scope the session between the user's provisioned role and a parent view. */
export const useSwitchRole = () => {
  const { token, refresh } = useSession()
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (role: 'parent' | 'teacher') =>
      apiFetch<{ token: string; user: { role: UserRole } }>('/api/auth/switch-role', { token, method: 'POST', body: { role } }),
    onSuccess: (data) => {
      setToken(data.token)
      refresh()
      qc.invalidateQueries()
    },
    onError: () => toast.error('Горим солих боломжгүй байна'),
  })
}

export const useUpdateMe = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (vars: { name?: string; phone?: string; email?: string }) =>
      apiFetch<unknown>('/api/auth/me', { token, method: 'PATCH', body: vars }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me'] }); toast.success('Мэдээлэл шинэчлэгдлээ') },
    onError: () => toast.error('Алдаа гарлаа'),
  })
}
