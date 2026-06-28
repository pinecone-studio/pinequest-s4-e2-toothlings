'use client'
import Image from 'next/image'
import { m, useTransform, type MotionValue } from 'framer-motion'

type ZoomProps = { p: MotionValue<number>; at: number; src: string; round?: boolean }

export const Zoom = ({ p, at, src, round = false }: ZoomProps) => {
  const scale = useTransform(p, [at, at + 0.07], [0, 1])
  return (
    <m.span
      style={{ scale, display: 'inline-block', verticalAlign: 'middle', position: 'relative' }}
      className={`mx-[0.04em] h-[0.9em] w-[0.9em] origin-center`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="100px"
        className={`object-cover object-center ${round ? 'rounded-full' : 'rounded-[14px]'}`}
      />
    </m.span>
  )
}
