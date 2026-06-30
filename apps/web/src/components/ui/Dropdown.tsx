'use client'

import { useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

export type DropdownOption<T extends string = string> = {
  value: T
  label: string
  Icon?: ComponentType<SVGProps<SVGSVGElement>>
  iconClass?: string
}

type Props<T extends string> = {
  value: T
  options: DropdownOption<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  size?: 'sm' | 'md'
  align?: 'left' | 'right'
  className?: string
  disabled?: boolean
}

const SIZE = {
  sm: 'gap-1.5 px-2.5 py-1.5 text-[12px]',
  md: 'gap-2 px-3 py-2 text-[13px]',
}

// Menu is portalled to document.body so it escapes any card stacking context
// (transform / opacity animations on parent cards block absolute-positioned children).
const Dropdown = <T extends string>({ value, options, onChange, ariaLabel, size = 'md', align = 'left', className, disabled = false }: Props<T>) => {
  const [open, setOpen] = useState(false)
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.value === value) ?? options[0]

  const toggle = () => {
    if (disabled) return
    if (!open && triggerRef.current) setMenuRect(triggerRef.current.getBoundingClientRect())
    setOpen((p) => !p)
  }

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      const t = e.target as Node
      if (!triggerRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false)
    }
    const scroll = () => setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('scroll', scroll, true)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('scroll', scroll, true)
    }
  }, [open])

  if (!current) return null

  const menuStyle: React.CSSProperties = menuRect
    ? {
        position: 'fixed',
        top: menuRect.bottom + 6,
        left: align === 'right' ? Math.max(8, menuRect.right - 200) : menuRect.left,
        minWidth: Math.max(menuRect.width, 180),
        zIndex: 400,
      }
    : { display: 'none' }

  return (
    <div ref={triggerRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={toggle}
        disabled={disabled}
        className={cn('btn flex w-full items-center rounded-full border border-border bg-surface font-semibold text-text-base transition-all duration-150 hover:border-primary', SIZE[size], disabled && 'cursor-not-allowed opacity-50 hover:border-border')}
      >
        {current.Icon && <current.Icon className={cn('size-4 shrink-0', current.iconClass ?? 'text-text-muted')} />}
        <span className="flex-1 truncate text-left">{current.label}</span>
        <ChevronDownIcon className={cn('size-3.5 shrink-0 text-text-muted transition-transform duration-150', open && 'rotate-180')} />
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={menuStyle}
          className="overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-(--shadow-float)"
        >
          {options.map((opt) => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={cn('btn flex w-full items-center gap-2.5 rounded-full px-3 py-2 text-left text-[12px] transition-colors duration-100 hover:bg-surface-raised', active ? 'bg-surface-raised font-semibold text-text-base' : 'text-text-muted')}
              >
                {opt.Icon && <opt.Icon className={cn('size-4 shrink-0', opt.iconClass ?? 'text-text-muted')} />}
                <span className="flex-1 truncate">{opt.label}</span>
                {active && <CheckIcon className="size-3.5 shrink-0 text-primary" />}
              </button>
            )
          })}
        </div>,
        document.body,
      )}
    </div>
  )
}

export default Dropdown
