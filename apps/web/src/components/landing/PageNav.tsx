'use client'
import { useState } from 'react'
import { useScroll, useMotionValueEvent, AnimatePresence, m } from 'framer-motion'
import { getLenis } from './LenisProvider'
import { NAV_ICONS } from './NavIcons'

const LABELS = ['Эхлэл', 'Багийн танилцуулга', 'Асуудал', 'Шийдэл', 'Апп']

export const PageNav = () => {
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const hero     = document.getElementById('hero')
    const stats    = document.getElementById('stats')
    const features = document.getElementById('features')
    const mobile   = document.getElementById('mobile')
    if (!hero) return
    const vh            = window.innerHeight
    const teamStart     = hero.offsetTop + (hero.offsetHeight - vh) * 0.38
    const statsStart    = stats    ? stats.offsetTop    - vh * 0.35 : Infinity
    const featuresStart = features ? features.offsetTop - vh * 0.35 : Infinity
    const mobileStart   = mobile   ? mobile.offsetTop   - vh * 0.35 : Infinity
    if      (y >= mobileStart)   setActive(4)
    else if (y >= featuresStart) setActive(3)
    else if (y >= statsStart)    setActive(2)
    else if (y >= teamStart)     setActive(1)
    else                         setActive(0)
  })

  const goTo = (index: number) => {
    const lenis = getLenis()
    const hero  = document.getElementById('hero')
    const scroll   = (top: number) => lenis ? lenis.scrollTo(top) : window.scrollTo({ top, behavior: 'smooth' })
    const scrollId = (id: string)  => lenis ? lenis.scrollTo(`#${id}`) : document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    if      (index === 0) scroll(0)
    else if (index === 1 && hero) scroll(hero.offsetTop + (hero.offsetHeight - window.innerHeight) * 0.44)
    else if (index === 2) scrollId('stats')
    else if (index === 3) scrollId('features')
    else if (index === 4) scrollId('mobile')
  }

  return (
    <div className="fixed left-6 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3">
      {[0, 1, 2, 3, 4].map((i) => {
        const Icon = NAV_ICONS[i]
        const on = active === i
        const hot = hovered === i || on
        return (
          <div key={i} className="flex items-center gap-4"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}>
            <button
              type="button"
              onClick={() => goTo(i)}
              aria-label={LABELS[i]}
              className="btn flex shrink-0 items-center justify-center transition-all duration-300"
              style={{ width: 52, height: 52, borderRadius: 16, background: on ? 'var(--olive)' : hot ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)', color: on ? '#0d1e35' : hot ? '#fff' : 'rgba(255,255,255,0.55)', border: `1px solid ${on ? 'var(--olive)' : hot ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.12)'}` }}
            >
              <Icon />
            </button>
            <AnimatePresence>
              {hovered === i && (
                <m.span
                  className="pointer-events-none whitespace-nowrap rounded-xl px-4 py-1.5 font-black uppercase shadow-(--shadow-card)"
                  style={{ fontSize: 14, letterSpacing: '0.04em', background: 'var(--olive)', color: '#0d1e35', border: '1px solid var(--olive)' }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {LABELS[i]}
                </m.span>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
