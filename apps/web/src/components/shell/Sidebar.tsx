'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useSession } from '@/components/providers'
import { useReviewQueue } from '@/hooks/useScreening'
import { useFollowUps } from '@/hooks/useFollowUps'
import { NAV_BY_ROLE } from './navConfig'
import { cn } from '@/lib/utils'

const Sidebar = () => {
  const pathname = usePathname()
  const { role, logout } = useSession()
  const items = role ? (NAV_BY_ROLE[role] ?? []) : []

  // Notification counts relocated here from the old TopBar — surfaced as a dot
  // on the relevant rail icon (no separate bell).
  const { data: reviewQueue } = useReviewQueue()
  const { data: followUps } = useFollowUps()
  const counts: Record<string, number> = {
    review: reviewQueue?.filter((r) => r.triageLevel === 'red').length ?? 0,
    followup: followUps?.filter((f) => f.status === 'flagged').length ?? 0,
  }

  return (
    <div className="flex w-20 flex-col items-center gap-1 py-5">
      <div
        className="mb-5 flex size-9 items-center justify-center rounded-xl text-[15px] font-bold shadow-(--shadow-card)"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
      >
        Smilo
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1.5" aria-label="Үндсэн цэс">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const badge = item.badgeKey ? (counts[item.badgeKey] ?? 0) : 0
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className="group flex w-full flex-col items-center gap-1 py-0.5"
            >
              <span className={cn(
                'btn relative flex size-11 items-center justify-center rounded-2xl transition-all duration-150',
                active ? 'bg-primary text-text-on-primary shadow-(--shadow-card)' : 'text-text-muted group-hover:bg-surface-raised group-hover:text-text-base',
              )}>
                <item.Icon className="size-[18px]" />
                {badge > 0 && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-triage-red ring-2 ring-surface" />}
              </span>
              <span className={cn('text-[9px] leading-none', active ? 'font-semibold text-text-base' : 'text-text-muted/70')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col items-center gap-2 pt-2">
        <button aria-label="Тохиргоо" className="btn flex size-10 items-center justify-center rounded-2xl text-text-muted transition-all duration-150 hover:bg-surface-raised hover:text-text-base">
          <Cog6ToothIcon className="size-[18px]" />
        </button>
        <button onClick={logout} aria-label="Гарах" className="btn flex size-10 items-center justify-center rounded-2xl text-text-muted transition-all duration-150 hover:bg-triage-red-bg hover:text-triage-red">
          <ArrowRightOnRectangleIcon className="size-[18px]" />
        </button>
      </div>
    </div>
  )
}

export default Sidebar
