import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Primary = Honey Gold w/ near-black text (never white on yellow). Focus ring
// + press-scale come from the global `.btn` rules in globals.css.
const button = cva(
  'btn inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:   'bg-primary text-text-on-primary hover:bg-primary-hover shadow-(--shadow-card)',
        secondary: 'border border-border bg-surface text-text-base hover:border-primary hover:text-primary',
        ghost:     'text-text-muted hover:bg-surface-raised hover:text-text-base',
        danger:    'bg-triage-red text-white hover:opacity-90',
      },
      size: {
        sm: 'px-3 py-1.5 text-[12px]',
        md: 'px-4 py-2 text-[13px]',
        lg: 'px-5 py-2.5 text-[14px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>

const Button = ({ className, variant, size, ...rest }: Props) => (
  <button className={cn(button({ variant, size }), className)} {...rest} />
)

export default Button
