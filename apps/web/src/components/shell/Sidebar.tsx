'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid'
import type { MouseEvent } from 'react'
import { useSession } from '@/components/providers'
import { useReviewQueue } from '@/hooks/useScreening'
import { useFollowUps } from '@/hooks/useFollowUps'
import { NAV_BY_ROLE } from './navConfig'
import { useRouteTransition } from './RouteTransition'
import { cn } from '@/lib/utils'

const Sidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { role, logout } = useSession()
  const { navigate, pendingHref } = useRouteTransition()
  const onLogout = () => { logout(); router.push('/') }
  const items = role ? (NAV_BY_ROLE[role] ?? []) : []

  // Route through the transition for a branded loading status; let modified
  // clicks (new tab, etc.) fall through to the real <Link href>.
  const onNavClick = (e: MouseEvent, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    navigate(href)
  }

  // Notification counts relocated here from the old TopBar — surfaced as a dot
  // on the relevant rail icon (no separate bell).
  const { data: reviewQueue } = useReviewQueue()
  const { data: followUps } = useFollowUps()
  const counts: Record<string, number> = {
    review: reviewQueue?.filter((r) => r.triageLevel === 'red').length ?? 0,
    followup: followUps?.filter((f) => f.status === 'flagged').length ?? 0,
  }

  return (
    <div className="flex w-[84px] flex-col items-center gap-1 py-5">
      {/* dark mode → yellow logo; light mode → black logo */}
      <Image src="/logoYellow.png" alt="Screener" width={48} height={48} priority className="hidden object-contain dark:block" />
      <Image src="/logoBlack.png" alt="Screener" width={48} height={48} priority className="block object-contain dark:hidden" />
      <p className="mb-4 text-center text-[10px] font-bold leading-tight tracking-wide">
        <span className="text-gray-900 dark:text-white">Tooth</span><span className="text-primary">Lings</span>
      </p>

      <nav className="flex flex-1 flex-col items-center gap-2" aria-label="Үндсэн цэс">
        {items.map((item) => {
          // During a pending nav, light up the destination immediately.
          const active = pendingHref
            ? pendingHref === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')
          const badge = item.badgeKey ? (counts[item.badgeKey] ?? 0) : 0
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => onNavClick(e, item.href)}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className="group flex w-full flex-col items-center gap-1"
            >
              <span className={cn(
                'tap relative flex size-12 items-center justify-center rounded-full transition-all duration-200',
                active
                  ? 'text-primary'
                  : 'text-text-muted group-hover:-translate-y-0.5 group-hover:bg-surface-raised group-hover:text-text-base',
              )}>
                <item.Icon className={cn('size-5 transition-transform duration-200', !active && 'group-hover:scale-110')} />
                {badge > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
                    <span className="notif-ping absolute inline-flex size-full rounded-full bg-triage-red opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-triage-red ring-2 ring-surface" />
                  </span>
                )}
              </span>
              <span className={cn('text-[10.5px] leading-none transition-colors', active ? 'font-bold text-text-base' : 'font-medium text-text-muted')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-2 flex flex-col items-center gap-2 border-t border-border-muted pt-3">
        <button onClick={onLogout} aria-label="Гарах" className="tap flex size-10 items-center justify-center rounded-full text-text-muted transition-all duration-150 hover:-translate-y-0.5 hover:bg-triage-red-bg hover:text-triage-red">
          <ArrowRightOnRectangleIcon className="size-5" />
        </button>
      </div>
    </div>
  )
}

export default Sidebar
