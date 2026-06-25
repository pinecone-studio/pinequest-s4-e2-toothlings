import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Triage + sync tones. Brand gold is NOT a status — "check" is amber/orange,
// so a status pill never collides with the brand accent.
export type Tone = 'danger' | 'check' | 'safe' | 'synced' | 'pending' | 'neutral'

const TEXT: Record<Tone, string> = {
  danger: 'text-triage-red', check: 'text-triage-yellow', safe: 'text-triage-green',
  synced: 'text-triage-green', pending: 'text-triage-yellow', neutral: 'text-text-muted',
}
const SOFT: Record<Tone, string> = {
  danger: 'bg-triage-red-bg', check: 'bg-triage-yellow-bg', safe: 'bg-triage-green-bg',
  synced: 'bg-triage-green-bg', pending: 'bg-triage-yellow-bg', neutral: 'bg-surface-raised',
}
const DOT: Record<Tone, string> = {
  danger: 'bg-triage-red', check: 'bg-triage-yellow', safe: 'bg-triage-green',
  synced: 'bg-triage-green', pending: 'bg-triage-yellow', neutral: 'bg-text-muted',
}

type Props = {
  tone: Tone
  children: ReactNode
  variant?: 'dot' | 'soft' // dot = inline (table); soft = tinted chip (badge)
  pulse?: boolean          // animate dot (e.g. pending sync)
  className?: string
}

const StatusPill = ({ tone, children, variant = 'dot', pulse, className }: Props) =>
  variant === 'soft' ? (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold', SOFT[tone], TEXT[tone], className)}>
      <span className={cn('size-1.5 rounded-full', DOT[tone])} />
      {children}
    </span>
  ) : (
    <span className={cn('inline-flex items-center gap-1.5 text-[12px] font-semibold', TEXT[tone], className)}>
      <span className={cn('size-2 shrink-0 rounded-full', DOT[tone], pulse && 'animate-pulse')} />
      {children}
    </span>
  )

export default StatusPill
