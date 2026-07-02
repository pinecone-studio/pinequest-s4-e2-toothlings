import { apiFetch } from '@/lib/api'

export type CallStatus = 'ringing' | 'answered' | 'declined'

export type CallInvite = {
  id: string
  roomId: string
  fromUserId: string
  fromName: string
  toUserId: string
  status: CallStatus
  createdAt: number
  expiresAt: number
}

/** Short-lived STUN+TURN ICE servers minted server-side (see server calls.ts /ice).
 *  Public endpoint — the mobile caller's browser tab has no session. */
export const getIceServers = (token: string | null = null) =>
  apiFetch<{ iceServers: RTCIceServer[] }>('/api/calls/ice', { token })

export const sendInvite = (token: string | null, roomId: string, toUserId: string, fromName: string) =>
  apiFetch<CallInvite>('/api/calls', { token, method: 'POST', body: { roomId, toUserId, fromName } })

export const getPendingInvites = (token: string | null) =>
  apiFetch<CallInvite[]>('/api/calls/pending', { token })

export const getInvite = (token: string | null, id: string) =>
  apiFetch<CallInvite | null>(`/api/calls/${id}`, { token })

export const answerInvite = (token: string | null, id: string) =>
  apiFetch<CallInvite | null>(`/api/calls/${id}/answer`, { token, method: 'POST' })

export const declineInvite = (token: string | null, id: string) =>
  apiFetch<CallInvite | null>(`/api/calls/${id}/decline`, { token, method: 'POST' })
