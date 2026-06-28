'use client'
import Link from 'next/link'
import { m, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

export const Header = () => {
  const [thresh, setThresh] = useState(300)
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  const wmarkOp = useTransform(scrollY, [thresh * 0.6, thresh], [0, 1])

  useEffect(() => {
    setMounted(true)
    setThresh(window.innerHeight * 0.55)
  }, [])

  if (!mounted) return null

  return (
    <nav className="fixed left-0 right-0 top-0 z-[140] flex items-center justify-between px-6 py-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <m.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-center bg-white/10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 2.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <Link href="/" className="flex items-center gap-2">
        <img src="/logoYellow.png" alt="Screener" className="h-9 w-9 object-contain" />
        <m.div style={{ opacity: wmarkOp }} className="flex items-baseline gap-1">
          <span style={{ color: 'var(--olive)', fontWeight: 900, fontSize: 18 }}>Screener</span>
        </m.div>
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/?auth=login"
          className="hidden rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 sm:inline-flex">
          Нэвтрэх
        </Link>
        <Link href="/?auth=register"
          className="rounded-full px-4 py-2 text-sm font-bold transition-colors hover:opacity-90"
          style={{ background: 'var(--olive)', color: '#0d1e35' }}>
          Эхлэх
        </Link>
      </div>
    </nav>
  )
}
