import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export type HelpRequestRow = {
  id: string
  childKey: string
  schoolId: string
  level: 'red' | 'yellow'
  status: 'open' | 'connected' | 'closed'
  note: string | null
  dentistId: string | null
  connectedAt: string | null
  createdAt: string
  child: { firstName: string; lastName: string; guardianPhone: string | null; guardianEmail: string | null } | null
  dentist: { id: string; displayName: string; org: string | null } | null
}

export type VolunteerDentist = {
  id: string
  userId: string
  displayName: string
  specialty: string | null
  org: string | null
  area: string | null
  avatarUrl: string | null
  lat: number | null
  lng: number | null
  isAvailable: boolean
}

export type VolunteerProfile = VolunteerDentist | null

export const useHelpRequests = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['help-requests'],
    queryFn: () => apiFetch<HelpRequestRow[]>('/api/help/requests', { token }),
    enabled: !!token,
  })
}

export const useVolunteerProfile = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['help-volunteer'],
    queryFn: () => apiFetch<VolunteerProfile>('/api/help/volunteer', { token }),
    enabled: !!token,
  })
}

export const useVolunteerDentists = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['help-volunteers-red'],
    queryFn: () => apiFetch<VolunteerDentist[]>('/api/help/volunteers/red', { token }),
    enabled: !!token,
    staleTime: 60_000,
  })
}

export const useUpsertVolunteer = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { displayName: string; specialty?: string; org?: string; area?: string; isAvailable?: boolean; lat?: number; lng?: number; avatarUrl?: string }) =>
      apiFetch<VolunteerProfile>('/api/help/volunteer', { token, method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['help-volunteer'] }),
  })
}

export const useConnectRequest = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/help/requests/${id}/connect`, { token, method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['help-requests'] }),
  })
}

export const useRequestHelp = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { childKey: string; level: 'red' | 'yellow'; note?: string }) =>
      apiFetch<HelpRequestRow>('/api/help/requests', { token, method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['help-requests'] }),
  })
}
