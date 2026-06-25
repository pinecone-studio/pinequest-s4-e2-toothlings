import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  pad?: boolean        // default inner padding
  interactive?: boolean // hover lift (clickable cards)
}

// The board's base surface: clean white, soft radius + subtle shadow on the
// warm cream canvas. One source of truth for card chrome.
const Card = ({ children, className, pad = true, interactive }: Props) => (
  <div
    className={cn(
      'rounded-2xl border border-border bg-surface shadow-(--shadow-card)',
      pad && 'p-5',
      interactive && 'transition-shadow duration-200 hover:shadow-(--shadow-card-lg)',
      className,
    )}
  >
    {children}
  </div>
)

export default Card
