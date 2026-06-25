'use client'

import { useState } from 'react'
import { CalendarDaysIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useSeason } from '@/components/SeasonProvider'

// Board-wide season picker. Hidden until at least one season exists.
const SeasonSelector = () => {
  const { seasonId, setSeasonId, seasons } = useSeason()
  const [open, setOpen] = useState(false)

  if (seasons.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="btn flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-[12px] font-semibold text-text-base shadow-(--shadow-card) transition-all duration-150 hover:border-primary"
      >
        <CalendarDaysIcon className="size-4 text-text-muted" />
        {seasonId ?? '—'}
        <ChevronDownIcon className={`size-3.5 text-text-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="listbox" className="absolute right-0 top-full z-20 mt-1 min-w-[160px] overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-(--shadow-float)">
          {seasons.map((s) => (
            <button
              key={s}
              role="option"
              aria-selected={s === seasonId}
              onClick={() => { setSeasonId(s); setOpen(false) }}
              className={`btn block w-full px-4 py-2 text-left text-[12px] transition-all duration-150 hover:bg-surface-raised ${s === seasonId ? 'font-semibold text-primary' : 'text-text-base'}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SeasonSelector
