'use client'
import { m, useTransform, useSpring, useMotionTemplate, cubicBezier, type MotionValue } from 'framer-motion'
import { INTRO, P, SPRING, EASE_EXPO } from './introBrand'

const EXPO = cubicBezier(EASE_EXPO[0], EASE_EXPO[1], EASE_EXPO[2], EASE_EXPO[3])

type Props = {
  progress: MotionValue<number>
  reduced: boolean
  willChange: string
}

// The logo + brand name, revealed inside the widening gap. The name is REAL
// heading text (<h1>) — never baked into the logo image (which is decorative).
// Scales 0.92→1 and fades in early, settles on a calm spring (no overshoot),
// then docks up toward the nav during the hand-off.
export const LogoReveal = ({ progress, reduced, willChange }: Props) => {
  const opacity = useTransform(progress, [0.12, 0.34, 0.86, 1], [0, 1, 1, 0])
  const scaleRaw = useTransform(progress, [0.12, 0.4, P.exitEnd, 1], [0.92, 1, 1, 0.42], { ease: EXPO })
  const scale = useSpring(scaleRaw, SPRING) // calm settle
  const dockY = useTransform(progress, [0.4, P.exitEnd, 1], [0, 0, -34], { ease: EXPO })
  const transform = useMotionTemplate`translateY(${dockY}vh) scale(${scale})`
  const haloOp = useTransform(progress, [0.12, 0.4, P.exitEnd, 1], [0, 0.5, 0.5, 0])

  const Brand = (
    <h1 className="m-0 select-none text-center leading-none" style={{ fontWeight: 900, letterSpacing: '-0.03em', fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}>
      <span style={{ color: INTRO.tooth }}>Tooth</span>
      <span style={{ color: INTRO.lings }}>Lings</span>
    </h1>
  )

  if (reduced) {
    return (
      <div className="absolute inset-0 grid place-items-center px-6">
        <div className="flex flex-col items-center gap-5">
          <img src="/logoYellow.png" alt="" aria-hidden="true" className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
          {Brand}
        </div>
      </div>
    )
  }

  return (
    <m.div className="absolute inset-0 grid place-items-center px-6" style={{ opacity, willChange }}>
      <m.div className="relative flex flex-col items-center gap-5" style={{ transform, willChange }}>
        {/* soft gold halo lifting the mark off the deep field */}
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10"
          style={{
            opacity: haloOp,
            width: '120%', height: '180%',
            background: `radial-gradient(ellipse at center, ${INTRO.glowSoft} 0%, transparent 62%)`,
            filter: 'blur(34px)',
          }}
        />
        <img src="/logoYellow.png" alt="" aria-hidden="true" className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
        {Brand}
      </m.div>
    </m.div>
  )
}
