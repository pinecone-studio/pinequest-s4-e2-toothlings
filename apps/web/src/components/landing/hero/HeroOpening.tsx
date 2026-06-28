'use client'
import { m, AnimatePresence, useReducedMotion } from 'framer-motion'

const PARTS = [
  { text: 'Шүдний', color: 'var(--olive)' },
  { text: 'Скрининг', color: '#fff' },
] as const

export const HeroOpening = ({ show }: { show: boolean }) => {
  const reduce = useReducedMotion()
  return (
    <AnimatePresence>
      {show && (
        <m.div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black"
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 80% 60% at center, #161616 0%, #000 70%)' }}
          />
          <m.div
            className="relative mb-10 h-px w-[180px] origin-center bg-white/22"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="relative flex flex-col items-center leading-[0.88]">
            {PARTS.map((part, i) => (
              <div key={part.text} className="overflow-hidden">
                <m.span
                  className="block select-none font-black uppercase"
                  style={{
                    fontSize: 'clamp(4rem, 12vw, 15rem)',
                    letterSpacing: '-0.04em',
                    color: part.color,
                  }}
                  initial={{ y: reduce ? 0 : '105%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.85, delay: 0.1 + i * 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {part.text}
                </m.span>
              </div>
            ))}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
