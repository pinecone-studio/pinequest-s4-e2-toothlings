import type { CSSProperties } from 'react'

type Props = { className?: string; rows?: number; gap?: number }

const Skeleton = ({ className = '', style }: { className?: string; style?: CSSProperties }) => (
  <div className={`skeleton rounded-lg ${className}`} style={style} />
)

export const SkeletonCard = ({ rows = 3 }: Props) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-(--shadow-card)">
    <Skeleton className="h-4 w-28" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
    ))}
  </div>
)

export const SkeletonChart = () => (
  <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-(--shadow-card)" style={{ minHeight: 340 }}>
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-36 rounded-full" />
    </div>
    <div className="flex flex-1 items-end gap-3 pt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <Skeleton className="w-full rounded-t-lg" style={{ height: `${40 + (i * 15) % 80}px` }} />
          <Skeleton className="h-2 w-8" />
        </div>
      ))}
    </div>
  </div>
)

export const SkeletonTable = () => (
  <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-(--shadow-card)">
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-7 w-20 rounded-lg" />
    </div>
    <div className="border-t border-border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-border-muted px-5 py-3">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  </div>
)

export default Skeleton
