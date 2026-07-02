'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type Peer from 'peerjs'
import type { DataConnection, MediaConnection } from 'peerjs'
import { getIceServers } from '@/lib/signaling'

export type CallStatus = 'connecting' | 'connected' | 'error'
type ControlMsg = { kind: 'hangup' }
type Role = 'host' | 'guest'

type Args = { roomId: string; role: Role; onRemoteHangup: () => void; onError?: (msg: string) => void }

// Fallback ICE if the server /ice endpoint (STUN+TURN) is unreachable. STUN alone
// only connects when a peer is directly reachable; cross-network calls (phone on
// cellular ↔ laptop elsewhere, symmetric NAT) need the TURN relay the server mints.
const FALLBACK_ICE: RTCIceServer[] = [{ urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302'] }]

// If no media connects within this window the call is treated as failed rather
// than spinning on "connecting" forever (matches the guest's 24×2.5s dial budget).
const CONNECT_TIMEOUT_MS = 60_000

export const useCallPeer = ({ roomId, role, onRemoteHangup, onError }: Args) => {
  const [status, setStatus] = useState<CallStatus>('connecting')
  const [hasRemoteStream, setHasRemoteStream] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const peerRef = useRef<Peer | null>(null)
  const dataRef = useRef<DataConnection | null>(null)
  const cbRef = useRef({ onRemoteHangup, onError })
  cbRef.current = { onRemoteHangup, onError }

  useEffect(() => {
    let cancelled = false
    let connected = false
    let retry: ReturnType<typeof setInterval> | null = null
    let timeout: ReturnType<typeof setTimeout> | null = null
    const hostId = `call-${roomId}-host`
    const stopRetry = () => { if (retry) { clearInterval(retry); retry = null } }

    const wireData = (conn: DataConnection) => {
      dataRef.current = conn
      conn.on('data', (d) => { if ((d as ControlMsg)?.kind === 'hangup') cbRef.current.onRemoteHangup() })
    }
    const onRemote = (stream: MediaStream) => {
      if (cancelled) return
      connected = true
      stopRetry()
      if (timeout) { clearTimeout(timeout); timeout = null }
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream
      setHasRemoteStream(true); setStatus('connected')
    }
    // The remote closing its media connection (hang up, tab close, peer destroyed)
    // is a reliable end signal even when the data-channel 'hangup' message never
    // arrives — without this the other side stays stuck "ringing" after a hang-up.
    const wireCall = (call: MediaConnection) => {
      call.on('stream', onRemote)
      call.on('close', () => { if (!cancelled) cbRef.current.onRemoteHangup() })
    }

    const setup = async () => {
      let stream: MediaStream
      try { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }) }
      catch { if (!cancelled) { setStatus('error'); cbRef.current.onError?.('camera_denied') } return }
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
      streamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream

      const { default: PeerCtor } = await import('peerjs')
      if (cancelled) return

      // Fetch fresh STUN+TURN servers before opening the peer so media can relay
      // through TURN when a direct path isn't available.
      const iceServers = await getIceServers().then((r) => r.iceServers).catch(() => FALLBACK_ICE)
      if (cancelled) return
      const peerOpts = { config: { iceServers } }

      const asGuest = () => {
        const peer = new PeerCtor(peerOpts); peerRef.current = peer
        peer.on('open', () => {
          let n = 0
          const dial = () => {
            n++
            const conn = peer.connect(hostId)
            conn.on('open', () => { wireData(conn); if (connected) stopRetry() })
            wireCall(peer.call(hostId, stream))
          }
          dial()
          retry = setInterval(() => {
            if (connected || n >= 24) {
              stopRetry()
              if (!connected && !cancelled) { setStatus('error'); cbRef.current.onError?.('connect_failed') }
              return
            }
            dial()
          }, 2500)
        })
        peer.on('error', () => { /* peer-unavailable during retry — ignored */ })
      }
      const asHost = () => {
        const peer = new PeerCtor(hostId, peerOpts); peerRef.current = peer
        peer.on('call', (call: MediaConnection) => { call.answer(stream); wireCall(call) })
        peer.on('connection', wireData)
        peer.on('error', (err) => { if (err.type === 'unavailable-id') { peer.destroy(); asGuest() } })
      }
      if (role === 'host') asHost(); else asGuest()

      // Fail loudly instead of spinning on "connecting" forever if media never flows
      // (e.g. NAT with no reachable TURN relay, or the signaling peer never appears).
      timeout = setTimeout(() => {
        if (!connected && !cancelled) { setStatus('error'); cbRef.current.onError?.('connect_timeout') }
      }, CONNECT_TIMEOUT_MS)
    }
    setup()

    return () => {
      cancelled = true
      if (retry) clearInterval(retry)
      if (timeout) clearTimeout(timeout)
      dataRef.current?.close()
      peerRef.current?.destroy()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [roomId, role])

  const toggleMic = useCallback(() => {
    const s = streamRef.current; if (!s) return
    setMicOn((on) => { const next = !on; s.getAudioTracks().forEach((t) => (t.enabled = next)); return next })
  }, [])
  const toggleCam = useCallback(() => {
    const s = streamRef.current; if (!s) return
    setCamOn((on) => { const next = !on; s.getVideoTracks().forEach((t) => (t.enabled = next)); return next })
  }, [])
  const hangUp = useCallback(() => {
    try { dataRef.current?.send({ kind: 'hangup' } satisfies ControlMsg) } catch { /* closed */ }
    dataRef.current?.close()
    peerRef.current?.destroy()
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  return { status, hasRemoteStream, localVideoRef, remoteVideoRef, micOn, camOn, toggleMic, toggleCam, hangUp }
}
