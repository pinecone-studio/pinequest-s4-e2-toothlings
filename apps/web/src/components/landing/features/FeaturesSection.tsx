'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { useScroll, useSpring, useReducedMotion } from 'framer-motion'
import { STEPS } from './featuresData'
import { FeaturesLeftPanel } from './FeaturesLeftPanel'

export const FeaturesSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const springP = useSpring(scrollYProgress, { stiffness: 80, damping: 20 })
  const p = reduce ? scrollYProgress : springP
  const [active, setActive] = useState(0)

  return (
    <section id="features" ref={ref} className="relative bg-black">
      <div className="md:hidden">
        {STEPS.map((step, i) => {
          const isOpen = active === i
          return (
            <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {isOpen && (
                <div>
                  <div className="relative flex h-[48dvh] w-full items-center justify-center overflow-hidden bg-black">
                    <div className="relative" style={{ width: '72%', height: '84%' }}>
                      <Image src={step.img} alt={step.title} fill className="object-contain" sizes="100vw" />
                    </div>
                  </div>
                  <div className="px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <p className="mb-6 text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{step.desc}</p>
                    <ul className="flex flex-col gap-4">
                      {step.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#F2B705' }} />
                          <span className="text-[16px] leading-snug" style={{ color: 'rgba(255,255,255,0.8)' }}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <button onClick={() => setActive(isOpen ? -1 : i)} className="flex w-full items-center justify-between px-6 py-5 text-left">
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.35em]" style={{ color: 'var(--olive)' }}>Онцлог {step.tag}</p>
                  <h3 className="font-black uppercase"
                    style={{ fontSize: 'clamp(1rem, 5vw, 1.4rem)', lineHeight: 0.92, letterSpacing: '-0.02em', color: isOpen ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'color 0.25s' }}>
                    {step.title}
                  </h3>
                </div>
                <span className="ml-4 shrink-0 text-[28px] font-thin leading-none" style={{ color: isOpen ? 'var(--olive)' : 'rgba(255,255,255,0.4)' }}>
                  {isOpen ? '−' : '+'}
                </span>
              </button>
            </div>
          )
        })}
      </div>
      <div className="hidden md:flex md:items-start">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <div className="sticky top-0 h-screen w-1/2 shrink-0 overflow-hidden will-change-transform">
          <FeaturesLeftPanel p={p} />
        </div>
        <div className="w-1/2 shrink-0">
          {STEPS.map((step, i) => (
            <div key={i} className="flex h-screen flex-col justify-center px-[6vw]">
              <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.35em]" style={{ color: 'var(--olive)' }}>Онцлог {step.tag}</p>
              <h3 className="mb-7 font-black uppercase"
                style={{ fontSize: 'clamp(1.8rem, 3.8vw, 5rem)', lineHeight: 0.92, letterSpacing: '-0.02em', color: '#fff' }}>
                {step.title}
              </h3>
              <p className="mb-9 leading-relaxed" style={{ fontSize: 'clamp(16px,1.5vw,20px)', maxWidth: '42ch', color: 'rgba(255,255,255,0.65)' }}>{step.desc}</p>
              <ul className="flex flex-col gap-5">
                {step.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-4">
                    <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full" style={{ background: '#F2B705' }} />
                    <span style={{ fontSize: 'clamp(15px,1.4vw,19px)', lineHeight: 1.5, color: 'rgba(255,255,255,0.8)' }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
