'use client'

import { useMemo, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { PillButton } from '@/components/consumer/warm/WarmUI'
import { buildSlots, slotLabel } from '@/lib/appointmentSlots'
import { saveAppointment } from '@/lib/consumerState'
import { cn } from '@/lib/utils'

/** Parent self-books a visit time for a red-triage child — fully infra-free. */
export const ScheduleAppointmentModal = ({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) => {
  const slots = useMemo(() => buildSlots(), [])
  const [picked, setPicked] = useState<Date | null>(null)
  const [booked, setBooked] = useState<Date | null>(null)

  const close = () => {
    setPicked(null)
    setBooked(null)
    onClose()
  }

  const confirm = () => {
    if (!picked) return
    saveAppointment({
      doctorName: 'Бүртгэлтэй шүдний эмч',
      clinic: 'Toothlings сүлжээ',
      datetime: picked.toISOString(),
      address: '',
    })
    setBooked(picked)
  }

  return (
    <Modal open={open} onClose={close} title="Цаг товлох" subtitle="Эцэг эх өөрөө цаг сонгоно" size="md">
      {booked ? (
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <p className="text-[15px] font-semibold text-text-base">Цаг баталгаажлаа ✅</p>
            <p className="mt-1 text-[13px] text-text-muted">{slotLabel(booked)}</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary-subtle p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-primary">Заавар</p>
            <p className="text-[13px] leading-relaxed text-text-base">
              Товлосон цагаас 2 минутын өмнө видео дуудлага хийх холбоос руу орно уу. Эмч дуудлагыг
              эхлүүлэх болно. Дуудлага 8-15 минут үргэлжлэх боломжтой.
            </p>
          </div>
          <PillButton variant="primary" className="w-full" onClick={close}>
            Ойлголоо
          </PillButton>
        </div>
      ) : (
        <>
          <p className="mb-3 text-[13px] text-text-muted">Боломжит цагаас сонгоно уу.</p>
          <div className="flex flex-wrap gap-2">
            {slots.map((d) => (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => setPicked(d)}
                className={cn(
                  'btn rounded-full border px-4 py-2 text-[13px] font-medium transition',
                  picked?.getTime() === d.getTime()
                    ? 'border-primary bg-primary/10 text-text-base'
                    : 'border-border bg-surface text-text-muted hover:border-primary/60',
                )}
              >
                {slotLabel(d)}
              </button>
            ))}
          </div>
          <PillButton variant="primary" className="mt-5 w-full" disabled={!picked} onClick={confirm}>
            Цаг товлох
          </PillButton>
        </>
      )}
    </Modal>
  )
}
