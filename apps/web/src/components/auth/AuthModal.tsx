'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { XMarkIcon } from '@heroicons/react/24/solid'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export type AuthMode = 'login' | 'register'

type Props = { open: boolean; onClose: () => void; initialMode?: AuthMode }

const AuthModal = ({ open, onClose, initialMode = 'login' }: Props) => {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [mounted, setMounted] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (open) {
      setMode(initialMode)
      document.body.style.overflow = 'hidden'
      setTimeout(() => closeRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open, initialMode])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface px-6 py-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Хаах"
          className="btn absolute right-4 top-4 rounded-full p-1.5 text-text-muted hover:bg-surface-raised hover:text-text-base"
        >
          <XMarkIcon className="size-5" />
        </button>

        {/* logo + name */}
        <div className="mb-5 flex items-center gap-2.5">
          <Image src="/logoYellow.png" alt="ToothLings" width={40} height={40} className="hidden object-contain dark:block" />
          <Image src="/logoBlack.png" alt="ToothLings" width={40} height={40} className="block object-contain dark:hidden" />
          <span className="text-[18px] font-semibold tracking-tight">
            <span className="text-gray-900 dark:text-white">Tooth</span><span className="text-primary">Lings</span>
          </span>
        </div>

        {/* top toggle tabs */}
        <div className="mb-5 flex rounded-full bg-surface-raised p-1">
          {(['login', 'register'] as AuthMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`btn flex-1 rounded-full px-3 py-2 text-[13px] font-semibold transition-all duration-150 ${
                mode === m
                  ? 'bg-surface text-text-base shadow-(--shadow-card)'
                  : 'text-text-muted hover:text-text-base'
              }`}
            >
              {m === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
            </button>
          ))}
        </div>

        {mode === 'login' ? (
          <LoginForm onDone={onClose} />
        ) : (
          <RegisterForm onDone={onClose} />
        )}
      </div>
    </div>,
    document.body,
  )
}

export default AuthModal
