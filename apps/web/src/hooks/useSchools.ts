import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { School } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export const useSchools = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['schools'],
    queryFn: () => apiFetch<School[]>('/api/schools', { token }),
    enabled: !!token,
  })
}

export const useCreateSchool = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; soumCode?: string; district?: string }) =>
      apiFetch<School>('/api/schools', { token, method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schools'] }),
  })
}
