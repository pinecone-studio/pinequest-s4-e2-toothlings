'use client'

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  /** Optional sticky footer (action buttons). */
  footer?: ReactNode
}

const Modal = ({ open, onClose, title, subtitle, children, footer }: Props) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="dialog-in flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-(--shadow-float)"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-[16px] font-semibold tracking-tight text-text-base">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[12px] text-text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Хаах"
            className="btn -mr-1 rounded-full p-1.5 text-text-muted transition-all duration-150 hover:bg-surface-raised hover:text-text-base"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-raised px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
