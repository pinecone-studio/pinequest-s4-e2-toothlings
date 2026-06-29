'use client'
import { m, useTransform, useMotionTemplate, cubicBezier, type MotionValue } from 'framer-motion'
import {
  INTRO, LIP_VB, SEAM_PATH, UPPER_LIP_PATH, LOWER_LIP_PATH,
  P, LIP_TRAVEL_VH, COMPRESS_VH, EASE_EXPO,
} from './introBrand'

const EXPO = cubicBezier(EASE_EXPO[0], EASE_EXPO[1], EASE_EXPO[2], EASE_EXPO[3])

type Props = {
  variant: 'upper' | 'lower'
  progress: MotionValue<number>
  willChange: string
}

// One organic lip, used twice. Upper translates up, lower translates down —
// both off the SAME progress value so they part in perfect symmetry. Only
// transform + opacity animate (compositor-only); the honey-gold rim glow rides
// the inner edge and travels with the lip.
export const Lip = ({ variant, progress, willChange }: Props) => {
  const upper = variant === 'upper'
  const fill = upper ? UPPER_LIP_PATH : LOWER_LIP_PATH

  // px-free, responsive vh travel: tiny anticipation press → part → clear.
  const travel = upper
    ? [0, COMPRESS_VH, -30, -LIP_TRAVEL_VH, -LIP_TRAVEL_VH]
    : [0, -COMPRESS_VH, 30, LIP_TRAVEL_VH, LIP_TRAVEL_VH]
  const vh = useTransform(progress, [0, P.compressEnd, P.partEnd, P.exitEnd, 1], travel, { ease: EXPO })
  const transform = useMotionTemplate`translateY(${vh}vh)`
  const glowOp = useTransform(progress, [0.06, 0.3, P.partEnd, P.exitEnd, 1], [0, 0.85, 1, 0.9, 0.6])

  const gradId = `lip-fill-${variant}`
  const blurId = `lip-blur-${variant}`

  return (
    <m.div className="absolute inset-0" style={{ transform, willChange }} aria-hidden="true">
      <svg className="h-full w-full" viewBox={`0 0 ${LIP_VB} ${LIP_VB}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1={upper ? '0' : '1'} x2="0" y2={upper ? '1' : '0'}>
            <stop offset="0%" stopColor={INTRO.base0} />
            <stop offset="68%" stopColor={INTRO.base1} />
            <stop offset="100%" stopColor={INTRO.base2} />
          </linearGradient>
          <filter id={blurId} x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* lip body */}
        <path d={fill} fill={`url(#${gradId})`} />

        {/* honey-gold inner-edge glow: soft blurred halo + crisp wet-rim highlight */}
        <m.g style={{ opacity: glowOp }}>
          <path
            d={SEAM_PATH}
            fill="none"
            stroke={INTRO.glow}
            strokeWidth={5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            filter={`url(#${blurId})`}
          />
          <path
            d={SEAM_PATH}
            fill="none"
            stroke={INTRO.glowHi}
            strokeWidth={1.4}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.9}
          />
        </m.g>
      </svg>
    </m.div>
  )
}
