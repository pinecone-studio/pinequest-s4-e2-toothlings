import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'
import type { ChildSummaryPayload } from './useChildSummary'

export type AppointmentRow = {
  id: string
  childKey: string
  childName: string | null
  className: string | null
  birthYear: number | null
  dentistId: string
  dentistName: string | null
  createdById: string
  level: 'red' | 'yellow'
  scheduledAt: number
  status: string
  /** Dentist's post-call advice for the next step. */
  note: string | null
  /** Full Jitsi room URL for the video call. */
  roomUrl: string
}

// Scheduled video calls. A dentist sees the calls booked with them; admins see all.
export const useMyAppointments = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['appointments'],
    queryFn: () => apiFetch<AppointmentRow[]>('/api/appointments', { token }),
    enabled: !!token,
    refetchInterval: 30_000,
  })
}

export type DentistSlot = { scheduledAt: number; kind: 'booked' | 'blocked' }

// A dentist's unavailable slots (booked + self-blocked; times only, no PII).
export const useDentistSlots = (dentistId: string | null) => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['dentist-slots', dentistId],
    queryFn: () => apiFetch<DentistSlot[]>(`/api/appointments/dentist/${dentistId}/slots`, { token }),
    enabled: !!token && !!dentistId,
    staleTime: 30_000,
  })
}

// The logged-in dentist's own blocked slots (ms timestamps).
export const useMyBlocks = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['my-blocks'],
    queryFn: () => apiFetch<number[]>('/api/availability/mine', { token }),
    enabled: !!token,
  })
}

// Block / unblock one of the dentist's own time slots.
export const useToggleBlock = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blockedAt, block }: { blockedAt: number; block: boolean }) =>
      apiFetch(`/api/availability/${block ? 'block' : 'unblock'}`, { token, method: 'POST', body: { blockedAt } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-blocks'] })
      qc.invalidateQueries({ queryKey: ['dentist-slots'] })
    },
  })
}

// Full clinical summary (photos, triage, advice, questionnaire) for a booked call.
// Authorized by appointment ownership, so a dentist with no class/school scope still sees it.
export const useAppointmentSummary = (apptId: string | null) => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['appointment-summary', apptId],
    queryFn: () => apiFetch<ChildSummaryPayload>(`/api/appointments/${apptId}/summary`, { token }),
    enabled: !!token && !!apptId,
    staleTime: 60_000,
  })
}

// Dentist saves their post-call advice note on an appointment.
export const useUpdateAppointmentNote = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      apiFetch(`/api/appointments/${id}`, { token, method: 'PATCH', body: { note } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}
