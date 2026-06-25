'use client'

import type { BrushZone } from '@/lib/consumerState'
import { cn } from '@/lib/utils'

const ZONE_MAP: Record<BrushZone, string> = {
  UL: 'tooth-q--ul',
  UR: 'tooth-q--ur',
  LL: 'tooth-q--ll',
  LR: 'tooth-q--lr',
}

export const ToothModel = ({
  activeZone,
  zoneScores,
  className,
}: {
  activeZone?: BrushZone
  zoneScores: Record<BrushZone, number>
  className?: string
}) => {
  const tone = (sec: number) => (sec >= 20 ? 'ok' : sec >= 10 ? 'warn' : 'miss')

  return (
    <div className={cn('tooth-stage', className)}>
      <div className="tooth-model">
        {(['UL', 'UR', 'LL', 'LR'] as BrushZone[]).map((z) => (
          <div
            key={z}
            className={cn(
              'tooth-q',
              ZONE_MAP[z],
              `tooth-q--${tone(zoneScores[z])}`,
              activeZone === z && 'tooth-q--active',
            )}
          />
        ))}
        <div className="tooth-center" aria-hidden />
      </div>
      <p className="mt-4 text-center text-[12px] text-text-muted">
        Ногоон — сайн · Шар — дутуу · Улаан — алгассан
      </p>
    </div>
  )
}
