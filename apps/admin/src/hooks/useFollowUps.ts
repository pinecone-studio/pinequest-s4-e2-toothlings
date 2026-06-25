import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { FollowUp, FollowUpStatus } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export type FollowUpRow = FollowUp & { childName: string | null; guardianPhone: string | null }

export const useFollowUps = (status?: string) => {
  const { token } = useSession()
  const qs = status ? `?status=${status}` : ''
  return useQuery({
    queryKey: ['followups', status ?? 'all'],
    queryFn: () => apiFetch<FollowUpRow[]>(`/api/followups${qs}`, { token }),
    enabled: !!token,
  })
}

export const useUpdateFollowUp = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { childKey: string; status: FollowUpStatus; version: number }) =>
      apiFetch<FollowUp>(`/api/followups/${vars.childKey}`, {
        token,
        method: 'PATCH',
        body: { status: vars.status, version: vars.version },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['followups'] }),
  })
}

export const useNotify = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { childKey: string; channel: string; note?: string }) =>
      apiFetch<FollowUp>(`/api/followups/${vars.childKey}/notify`, {
        token,
        method: 'POST',
        body: { channel: vars.channel, note: vars.note },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['followups'] }),
  })
}
