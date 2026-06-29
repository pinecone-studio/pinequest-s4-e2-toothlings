'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type Peer from 'peerjs'
import type { DataConnection, MediaConnection } from 'peerjs'

export type CallStatus = 'connecting' | 'connected' | 'error'
type ControlMsg = { kind: 'hangup' }
type Role = 'host' | 'guest'

type Args = { roomId: string; role: Role; onRemoteHangup: () => void; onError?: (msg: string) => void }

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
    let retry: ReturnType<typeof setInterval> | null = null
    const hostId = `call-${roomId}-host`

    const wireData = (conn: DataConnection) => {
      dataRef.current = conn
      conn.on('data', (d) => { if ((d as ControlMsg)?.kind === 'hangup') cbRef.current.onRemoteHangup() })
    }
    const onRemote = (stream: MediaStream) => {
      if (cancelled) return
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream
      setHasRemoteStream(true); setStatus('connected')
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

      const asGuest = () => {
        const peer = new PeerCtor(); peerRef.current = peer
        peer.on('open', () => {
          let n = 0
          const dial = () => {
            n++
            const conn = peer.connect(hostId)
            conn.on('open', () => { wireData(conn); if (retry) { clearInterval(retry); retry = null } })
            peer.call(hostId, stream).on('stream', onRemote)
          }
          dial()
          retry = setInterval(() => {
            if (dataRef.current?.open || n >= 24) { if (retry) clearInterval(retry); retry = null; return }
            dial()
          }, 2500)
        })
        peer.on('error', () => { /* peer-unavailable during retry — ignored */ })
      }
      const asHost = () => {
        const peer = new PeerCtor(hostId); peerRef.current = peer
        peer.on('call', (call: MediaConnection) => { call.answer(stream); call.on('stream', onRemote) })
        peer.on('connection', wireData)
        peer.on('error', (err) => { if (err.type === 'unavailable-id') { peer.destroy(); asGuest() } })
      }
      if (role === 'host') asHost(); else asGuest()
    }
    setup()

    return () => {
      cancelled = true
      if (retry) clearInterval(retry)
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
