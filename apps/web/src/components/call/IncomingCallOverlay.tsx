'use client'

import { PhoneIcon, PhoneXMarkIcon } from '@heroicons/react/24/solid'
import type { CallInvite } from '@/lib/signaling'

type Props = { invite: CallInvite; onAccept: () => void; onDecline: () => void }

// Full-screen ringing overlay for the callee.
const IncomingCallOverlay = ({ invite, onAccept, onDecline }: Props) => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-10 bg-black/85 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-3">
      <div className="flex size-24 animate-pulse items-center justify-center rounded-full bg-primary text-3xl font-bold text-text-on-primary">
        {invite.fromName.charAt(0).toUpperCase()}
      </div>
      <p className="text-xl font-bold text-white">{invite.fromName}</p>
      <p className="text-sm text-white/60">Видео дуудлага ирж байна…</p>
    </div>
    <div className="flex items-center gap-12">
      <button onClick={onDecline} className="flex flex-col items-center gap-2">
        <span className="flex size-16 items-center justify-center rounded-full bg-triage-red text-white transition hover:opacity-90"><PhoneXMarkIcon className="size-7" /></span>
        <span className="text-[12px] text-white/70">Татгалзах</span>
      </button>
      <button onClick={onAccept} className="flex flex-col items-center gap-2">
        <span className="flex size-16 animate-bounce items-center justify-center rounded-full bg-triage-green text-white transition hover:opacity-90"><PhoneIcon className="size-7" /></span>
        <span className="text-[12px] text-white/70">Хүлээж авах</span>
      </button>
    </div>
  </div>
)

export default IncomingCallOverlay
