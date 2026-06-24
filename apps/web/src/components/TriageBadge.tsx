import type { TriageLevel } from '@pinequest/types'
import { cn } from '@/lib/utils'

const styles: Record<string, string> = {
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-amber-100 text-amber-700',
  green: 'bg-green-100 text-green-700',
}

const labels: Record<string, string> = { red: 'Улаан', yellow: 'Шар', green: 'Ногоон' }

export const TriageBadge = ({ level }: { level: TriageLevel | string }) => (
  <span
    className={cn(
      'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
      styles[level] ?? 'bg-neutral-100 text-neutral-700',
    )}
  >
    {labels[level] ?? level}
  </span>
)
