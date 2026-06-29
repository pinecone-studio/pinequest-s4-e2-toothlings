'use client'

import Modal from '@/components/ui/Modal'

type Props = {
  open: boolean
  onClose: () => void
  roomUrl: string
  dentistName: string
}

// Real Jitsi Meet call embedded in-app (desktop browsers run meet.jit.si in an
// iframe directly — no SDK/package or API key needed). The room is PII-free.
const JitsiCallModal = ({ open, onClose, roomUrl, dentistName }: Props) => (
  <Modal open={open} onClose={onClose} title="Видео дуудлага" subtitle={`${dentistName} · Шифрлэгдсэн`} size="xl">
    <iframe
      src={roomUrl}
      title="Jitsi video call"
      allow="camera; microphone; fullscreen; display-capture; autoplay"
      className="h-[68vh] w-full rounded-xl border-0"
    />
    <a href={roomUrl} target="_blank" rel="noreferrer" className="mt-2 block text-center text-[12px] text-primary hover:underline">
      Шинэ цонхонд нээх
    </a>
  </Modal>
)

export default JitsiCallModal
