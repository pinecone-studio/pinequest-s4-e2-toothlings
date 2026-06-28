'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import type { ReactNode } from 'react'

let _lenis: Lenis | null = null
export const getLenis = () => _lenis

export const LenisProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    document.documentElement.classList.add('no-scrollbar')
    _lenis = new Lenis()
    let rafId: number
    const raf = (t: number) => {
      _lenis!.raf(t)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      _lenis?.destroy()
      _lenis = null
      document.documentElement.classList.remove('no-scrollbar')
    }
  }, [])
  return <>{children}</>
}
