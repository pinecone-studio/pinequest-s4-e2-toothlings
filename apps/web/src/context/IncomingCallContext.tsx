'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from '@/components/providers'
import { useMe } from '@/hooks/useMe'
import { getPendingInvites, answerInvite, declineInvite, sendInvite, type CallInvite } from '@/lib/signaling'
import { startRingtone } from '@/lib/ringtone'
import IncomingCallOverlay from '@/components/call/IncomingCallOverlay'

type Ctx = { startCall: (toUserId: string, label?: string) => Promise<void> }
const CallCtx = createContext<Ctx | null>(null)
export const useCall = (): Ctx => {
  const c = useContext(CallCtx)
  if (!c) throw new Error('useCall must be used within IncomingCallProvider')
  return c
}

const handled = (id: string) => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`call:${id}`) === '1'
const markHandled = (id: string) => { try { sessionStorage.setItem(`call:${id}`, '1') } catch { /* private mode */ } }

// Global incoming-call detection: polls pending invites, rings, syncs tabs via
// BroadcastChannel, and exposes startCall() to place a call.
export const IncomingCallProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useSession()
  const { data: me } = useMe()
  const router = useRouter()
  const path = usePathname()
  const [incoming, setIncoming] = useState<CallInvite | null>(null)
  const stopRing = useRef<(() => void) | null>(null)
  const bc = useRef<BroadcastChannel | null>(null)
  const onCallPage = path?.startsWith('/call/') ?? false

  const clear = useCallback(() => {
    stopRing.current?.(); stopRing.current = null
    setIncoming(null)
    if (typeof document !== 'undefined') document.title = 'Screener'
  }, [])

  useEffect(() => {
    if (!token || onCallPage) return
    let active = true
    const poll = async () => {
      const list = await getPendingInvites(token).catch(() => [] as CallInvite[])
      if (!active) return
      const fresh = list.find((i) => i.status === 'ringing' && i.expiresAt > Date.now() && !handled(i.id))
      setIncoming((cur) => {
        if (cur || !fresh) return cur
        stopRing.current = startRingtone()
        if (typeof document !== 'undefined') document.title = `📞 ${fresh.fromName}…`
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') new Notification(`${fresh.fromName} дуудаж байна`)
        bc.current?.postMessage({ type: 'ringing', id: fresh.id })
        return fresh
      })
    }
    void poll()
    const iv = setInterval(poll, 3000)
    return () => { active = false; clearInterval(iv) }
  }, [token, onCallPage])

  useEffect(() => {
    const ch = new BroadcastChannel('screener-calls')
    bc.current = ch
    ch.onmessage = (e: MessageEvent<{ type: string; id: string }>) => {
      if (e.data?.type === 'handled') { markHandled(e.data.id); clear() }
    }
    return () => ch.close()
  }, [clear])

  useEffect(() => { if (typeof Notification !== 'undefined' && Notification.permission === 'default') void Notification.requestPermission() }, [])

  const accept = useCallback(async () => {
    if (!incoming) return
    const inv = incoming
    markHandled(inv.id); bc.current?.postMessage({ type: 'handled', id: inv.id }); clear()
    await answerInvite(token, inv.id).catch(() => {})
    router.push(`/call/${inv.roomId}?as=guest&returnTo=${encodeURIComponent(path ?? '/dashboard')}`)
  }, [incoming, token, router, path, clear])

  const decline = useCallback(async () => {
    if (!incoming) return
    const inv = incoming
    markHandled(inv.id); bc.current?.postMessage({ type: 'handled', id: inv.id }); clear()
    await declineInvite(token, inv.id).catch(() => {})
  }, [incoming, token, clear])

  const startCall = useCallback(async (toUserId: string, label?: string) => {
    const roomId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    const inv = await sendInvite(token, roomId, toUserId, me?.name ?? label ?? 'Дуудлага').catch(() => null)
    router.push(`/call/${roomId}?as=host&inviteId=${inv?.id ?? ''}&returnTo=${encodeURIComponent(path ?? '/dashboard')}`)
  }, [token, me, router, path])

  return (
    <CallCtx.Provider value={{ startCall }}>
      {children}
      {incoming && !onCallPage && <IncomingCallOverlay invite={incoming} onAccept={accept} onDecline={decline} />}
    </CallCtx.Provider>
  )
}
