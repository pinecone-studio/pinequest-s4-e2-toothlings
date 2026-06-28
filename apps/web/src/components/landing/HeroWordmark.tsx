'use client'
import { m, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

export const HeroWordmark = () => {
  const [d, setD] = useState({ x: 0, y: 0, s: 5, t: 400 })
  const { scrollY } = useScroll()

  useEffect(() => {
    const calc = () => setD({
      x: window.innerWidth / 2 - 60,
      y: window.innerHeight * 0.28 - 30,
      s: Math.max(3.5, Math.min(7, window.innerWidth / 200)),
      t: window.innerHeight * 0.55,
    })
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  const x        = useTransform(scrollY, [0, d.t], [d.x, 0])
  const y        = useTransform(scrollY, [0, d.t], [d.y, 0])
  const scale    = useTransform(scrollY, [0, d.t], [d.s, 1])
  const scrollOp = useTransform(scrollY, [d.t * 0.6, d.t], [1, 0])

  return (
    <m.div
      style={{ x, y, scale, opacity: scrollOp, transformOrigin: 'left center' }}
      className="pointer-events-none fixed left-[80px] top-[24px] z-[45] flex items-baseline gap-[0.1em]"
      aria-hidden="true"
    >
      <m.span
        style={{ color: 'var(--olive)', fontWeight: 900, fontSize: 18 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        Screener
      </m.span>
    </m.div>
  )
}
