import { cn } from '@/lib/utils'

const CORNERS = [
  'left-3 top-3 border-l-2 border-t-2',
  'right-3 top-3 border-r-2 border-t-2',
  'left-3 bottom-3 border-l-2 border-b-2',
  'right-3 bottom-3 border-r-2 border-b-2',
] as const

/** Scanner overlay shown over the intraoral image while AI analysis is running. */
export const ScreeningOverlay = () => (
  <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl">
    <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]" />

    <div className="scan-line absolute inset-x-0 h-16 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#F3B900]/40 to-transparent">
      <div className="absolute inset-x-0 top-1/2 h-px bg-[#F3B900] shadow-[0_0_12px_2px_rgba(243,185,0,0.7)]" />
    </div>

    {CORNERS.map((c) => (
      <span key={c} className={cn('absolute size-6 rounded-[3px] border-[#F3B900]/80', c)} />
    ))}
  </div>
)
