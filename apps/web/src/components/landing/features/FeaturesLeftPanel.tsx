'use client'
import Image from 'next/image'
import { m, useTransform, type MotionValue } from 'framer-motion'
import { CameraIcon, BeakerIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/solid'
import { STEPS, T1S, T1E, T2S, T2E } from './featuresData'
import type { ComponentType, SVGProps } from 'react'

const GRADIENT = 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 28%), linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 28%)'
const ICONS: ComponentType<SVGProps<SVGSVGElement>>[] = [CameraIcon, BeakerIcon, ClipboardDocumentCheckIcon]

const ImgFrame = ({ src }: { src: string }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black">
    <div className="relative" style={{ width: '58%', height: '72%' }}>
      <Image src={src} alt="" fill className="object-contain" sizes="30vw" />
    </div>
    <div className="pointer-events-none absolute inset-0" style={{ background: GRADIENT }} />
  </div>
)

export const FeaturesLeftPanel = ({ p }: { p: MotionValue<number> }) => {
  const rawInset2 = useTransform(p, [T1S, T1E], [100, 0])
  const rawInset3 = useTransform(p, [T2S, T2E], [100, 0])
  const clip2 = useTransform(rawInset2, (v) => `inset(${Math.max(0, Math.min(100, v))}% 0 0 0)`)
  const clip3 = useTransform(rawInset3, (v) => `inset(${Math.max(0, Math.min(100, v))}% 0 0 0)`)

  const op0 = useTransform(p, [T1S, T1E], [1, 0.22])
  const op1 = useTransform(p, [T1S, T1E, T2S, T2E], [0.22, 1, 1, 0.22])
  const op2 = useTransform(p, [T2S, T2E], [0.22, 1])
  const col0 = useTransform(op0, [0.22, 1], ['rgba(255,255,255,0.28)', '#F2B705'])
  const col1 = useTransform(op1, [0.22, 1], ['rgba(255,255,255,0.28)', '#F2B705'])
  const col2 = useTransform(op2, [0.22, 1], ['rgba(255,255,255,0.28)', '#F2B705'])
  const cols = [col0, col1, col2]

  return (
    <>
      <div className="absolute inset-0 z-[1]"><ImgFrame src={STEPS[0].img} /></div>
      <m.div style={{ clipPath: clip2, zIndex: 2 }} className="absolute inset-0"><ImgFrame src={STEPS[1].img} /></m.div>
      <m.div style={{ clipPath: clip3, zIndex: 3 }} className="absolute inset-0"><ImgFrame src={STEPS[2].img} /></m.div>
      <div className="absolute left-10 top-[22%] z-20">
        <div className="relative flex flex-col gap-7">
          <div className="pointer-events-none absolute bottom-1 left-[1px] top-1 w-[1px]" style={{ background: 'rgba(255,255,255,0.14)' }} />
          {STEPS.map((_, i) => {
            const Icon = ICONS[i]
            return (
              <div key={i} className="flex items-center gap-4">
                <m.div style={{ background: cols[i], minHeight: '1.5rem' }} className="w-[3px] shrink-0 self-stretch rounded-full" />
                <m.div style={{ color: cols[i] }}>
                  <Icon style={{ width: 'clamp(28px, 3vw, 52px)', height: 'clamp(28px, 3vw, 52px)' }} />
                </m.div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
