'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MicrophoneIcon, VideoCameraIcon, VideoCameraSlashIcon, PhoneXMarkIcon } from '@heroicons/react/24/solid'
import { useSession } from '@/components/providers'
import { useCallPeer } from '@/hooks/useCallPeer'
import { startRingback } from '@/lib/ringtone'
import { getInvite } from '@/lib/signaling'

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
const PIP = 'h-36 w-24 sm:h-44 sm:w-32'

const CallSession = ({ roomId }: { roomId: string }) => {
  const router = useRouter()
  const params = useSearchParams()
  const role = params.get('as') === 'guest' ? 'guest' : 'host'
  const returnTo = params.get('returnTo') || '/dashboard'
  const inviteId = params.get('inviteId')
  const { token } = useSession()
  const [secs, setSecs] = useState(0)
  const [ended, setEnded] = useState<string | null>(null)

  const leave = useCallback(() => router.replace(returnTo), [router, returnTo])
  const { status, hasRemoteStream, localVideoRef, remoteVideoRef, micOn, camOn, toggleMic, toggleCam, hangUp } = useCallPeer({
    roomId, role,
    onRemoteHangup: () => { setEnded('Дуудлага дууслаа'); setTimeout(leave, 1200) },
    onError: (msg) => setEnded(msg === 'camera_denied' ? 'Камер/микрофоныг ашиглах боломжгүй' : 'Холбогдож чадсангүй'),
  })

  useEffect(() => { if (status === 'connected') return; return startRingback() }, [status])
  useEffect(() => { if (status !== 'connected') return; const iv = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(iv) }, [status])
  useEffect(() => {
    if (role !== 'host' || !inviteId || status === 'connected' || ended) return
    const iv = setInterval(async () => {
      const inv = await getInvite(token, inviteId).catch(() => null)
      if (inv?.status === 'declined') { clearInterval(iv); setEnded('Дуудлагаас татгалзлаа'); setTimeout(leave, 1500) }
    }, 2000)
    return () => clearInterval(iv)
  }, [role, inviteId, status, token, leave, ended])

  return (
    <div className="fixed inset-0 z-50 bg-[#10141c]">
      <video ref={remoteVideoRef} autoPlay playsInline className={`absolute inset-0 h-full w-full object-cover ${hasRemoteStream ? '' : 'hidden'}`} />
      {!hasRemoteStream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
          <div className="size-24 animate-pulse rounded-full bg-white/10" />
          <p className="text-lg font-semibold">{ended ?? (status === 'error' ? 'Алдаа гарлаа' : 'Дуудаж байна…')}</p>
        </div>
      )}

      <div className="absolute inset-x-0 top-0 flex justify-center p-4">
        <span className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[13px] font-medium text-white">
          <span className="size-2 rounded-full bg-triage-green" /> {status === 'connected' ? fmt(secs) : 'Холбогдож байна'}
        </span>
      </div>

      <video ref={localVideoRef} autoPlay playsInline muted className={`absolute right-4 top-16 rounded-2xl border-2 border-white/30 object-cover ${PIP} ${camOn ? '' : 'hidden'}`} />
      {!camOn && <div className={`absolute right-4 top-16 flex items-center justify-center rounded-2xl border-2 border-white/30 bg-[#1c2433] text-[11px] text-white/60 ${PIP}`}>Камер хаалттай</div>}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4 p-8">
        <button onClick={toggleMic} aria-label="Микрофон" className={`flex size-14 items-center justify-center rounded-full transition ${micOn ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-white text-[#10141c]'}`}><MicrophoneIcon className="size-6" /></button>
        <button onClick={() => { hangUp(); leave() }} aria-label="Таслах" className="flex size-16 items-center justify-center rounded-full bg-triage-red text-white transition hover:opacity-90"><PhoneXMarkIcon className="size-7" /></button>
        <button onClick={toggleCam} aria-label="Камер" className={`flex size-14 items-center justify-center rounded-full transition ${camOn ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-white text-[#10141c]'}`}>{camOn ? <VideoCameraIcon className="size-6" /> : <VideoCameraSlashIcon className="size-6" />}</button>
      </div>
    </div>
  )
}

export default CallSession
