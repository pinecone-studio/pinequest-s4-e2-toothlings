'use client'
import { useRef } from 'react'
import { useScroll, useReducedMotion, type MotionValue } from 'framer-motion'

// Single source of truth for the opening. One useScroll over the pinned
// section drives every transform downstream, so the two lips, the logo and the
// hand-off stay perfectly in sync. Lenis already smooths the underlying scroll
// (see LenisProvider) and framer reads that position — we don't double-smooth
// here, so the lips track the gesture tightly.
export const useIntroProgress = (): {
  ref: React.RefObject<HTMLDivElement | null>
  progress: MotionValue<number>
  reduced: boolean
} => {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = !!useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    // 0 when the section top hits the viewport top; 1 when its bottom does.
    offset: ['start start', 'end end'],
  })
  return { ref, progress: scrollYProgress, reduced }
}
