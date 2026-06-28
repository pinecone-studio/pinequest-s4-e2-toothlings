'use client'
import { useRef } from 'react'
import { m, useScroll, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { GraphPaper } from './GraphPaper'
import { FlowNode } from './FlowNode'
import { FlowArrow } from './FlowArrow'
import { STEPS, CONNECTORS, CANVAS_W, CANVAS_H, ACCENT } from './storyContent'

const center = (i: number) => ({ x: STEPS[i].fx * CANVAS_W, y: STEPS[i].fy * CANVAS_H })

// Each node reveals (scrubbed) in sequence; constant motion runs regardless.
const NodeReveal = ({ p, index }: { p: MotionValue<number>; index: number }) => {
  const s = index * 0.15
  const opacity = useTransform(p, [s, s + 0.08], [0, 1])
  const scale = useTransform(p, [s, s + 0.08], [0.9, 1])
  const step = STEPS[index]
  return (
    <m.div
      className="absolute z-20 will-change-transform"
      style={{ left: `${step.fx * 100}%`, top: `${step.fy * 100}%`, x: '-50%', y: '-50%', opacity, scale }}
    >
      <FlowNode step={step} index={index} />
    </m.div>
  )
}

const ArrowReveal = ({ p, index }: { p: MotionValue<number>; index: number }) => {
  const s = index * 0.15 + 0.05
  const opacity = useTransform(p, [s, s + 0.1], [0, 1])
  const c = CONNECTORS[index]
  return (
    <m.g style={{ opacity }}>
      <FlowArrow from={center(c.from)} to={center(c.to)} bow={c.bow} />
    </m.g>
  )
}

// Desktop only: pin the canvas and scrub the six-step flow into view.
export const ScrollStoryDesktop = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 22 })

  return (
    <div ref={ref} className="relative h-[560vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden pl-0 lg:pl-28">
        <GraphPaper />
        <div className="absolute left-0 right-0 top-[10vh] mx-auto max-w-6xl px-6">
          <p className="text-[12px] font-bold uppercase tracking-[0.35em]" style={{ color: ACCENT }}>
           <span className="text-white">Tooth</span><span style={{ color: ACCENT }}>Lings</span> платформ нь:
          </p>
        </div>
        <div className="relative mx-auto aspect-[16/9] w-full max-w-335">
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} aria-hidden>
            {CONNECTORS.map((_, i) => (
              <ArrowReveal key={i} p={p} index={i} />
            ))}
          </svg>
          {STEPS.map((_, i) => (
            <NodeReveal key={i} p={p} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
