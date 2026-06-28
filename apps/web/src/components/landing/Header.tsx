'use client'
import Link from 'next/link'
import { m, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { homeForRole } from '@/lib/auth'
import { useSession } from '@/components/providers'

export const Header = () => {
  const [thresh, setThresh] = useState(300)
  const [mounted, setMounted] = useState(false)
  const { token, role } = useSession()
  const { scrollY } = useScroll()
  const wmarkOp = useTransform(scrollY, [thresh * 0.6, thresh], [0, 1])

  useEffect(() => {
    setMounted(true)
    setThresh(window.innerHeight * 0.55)
  }, [])

  if (!mounted) return null

  const loggedIn = !!token

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
        <img src="/logoYellow.png" alt="ToothLings" className="h-9 w-9 object-contain" />
        <m.div style={{ opacity: wmarkOp }} className="flex items-baseline gap-1">
          <span style={{ fontWeight: 900, fontSize: 18 }}>
            <span style={{ color: '#fff' }}>Tooth</span><span style={{ color: 'var(--olive)' }}>Lings</span>
          </span>
        </m.div>
      </Link>
      <div className="flex items-center gap-3">
        {loggedIn ? (
          <Link href={homeForRole(role)}
            className="btn inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-text-on-primary shadow-(--shadow-card) transition-all duration-150 hover:bg-primary-hover">
            Эхлэх
          </Link>
        ) : (
          <Link href="/?auth=login"
            className="btn inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-text-on-primary shadow-(--shadow-card) transition-all duration-150 hover:bg-primary-hover">
            Нэвтрэх
          </Link>
        )}
      </div>
    </nav>
  )
}
