'use client'
import { type ReactNode } from 'react'
import { m, useTransform, useMotionTemplate, cubicBezier, type MotionValue } from 'framer-motion'
import { INTRO, EASE_EXPO, STAGGER } from './introBrand'

const EXPO = cubicBezier(EASE_EXPO[0], EASE_EXPO[1], EASE_EXPO[2], EASE_EXPO[3])
const HANDOFF = 0.8 // first content starts rising as the logo docks

// y-only entrance (project convention: never x). Each item starts a beat after
// the previous (~70ms feel) off the same progress value.
const Rise = ({ progress, start, isStatic, children }: {
  progress: MotionValue<number>
  start: number
  isStatic: boolean
  children: ReactNode
}) => {
  const y = useTransform(progress, [start, start + 0.12], [24, 0], { ease: EXPO })
  const opacity = useTransform(progress, [start, start + 0.12], [0, 1])
  const transform = useMotionTemplate`translateY(${y}px)`
  if (isStatic) return <div>{children}</div>
  return <m.div style={{ opacity, transform, willChange: 'transform' }}>{children}</m.div>
}

// The next screen's first content — docked-state hero. Rises in (y only) during
// the hand-off, then the pin releases into normal page scroll.
export const NextScreenIntro = ({ progress, isStatic }: { progress: MotionValue<number>; isStatic: boolean }) => (
  <div className="pointer-events-auto absolute inset-x-0 bottom-[12vh] z-20 mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center">
    <Rise progress={progress} start={HANDOFF + STAGGER} isStatic={isStatic}>
      <h2 className="max-w-3xl text-balance font-black" style={{ fontSize: 'clamp(1.4rem, 3.6vw, 3rem)', lineHeight: 1.14, letterSpacing: '-0.025em' }}>
        <span style={{ color: INTRO.lings }}>Амны хөндийн байдлыг үнэлэн</span>{' '}
        <span style={{ color: '#fff' }}>эмчид цаг алдалгүй чиглүүлнэ.</span>
      </h2>
    </Rise>
  </div>
)
