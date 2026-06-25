import type { TriageLevel } from '@pinequest/types'
import { cn } from '@/lib/utils'

const styles: Record<string, string> = {
  red: 'bg-triage-red-bg text-triage-red',
  yellow: 'bg-triage-yellow-bg text-triage-yellow',
  green: 'bg-triage-green-bg text-triage-green',
}

const labels: Record<string, string> = { red: 'Улаан', yellow: 'Шар', green: 'Ногоон' }

export const TriageBadge = ({ level }: { level: TriageLevel | string }) => (
  <span
    className={cn(
      'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
      styles[level] ?? 'bg-border text-text-muted',
    )}
  >
    {labels[level] ?? level}
  </span>
)
