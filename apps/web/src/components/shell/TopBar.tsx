'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MagnifyingGlassIcon, BellIcon, MoonIcon, SunIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useSession } from '@/components/providers'
import { useReviewQueue } from '@/hooks/useScreening'
import { useFollowUps } from '@/hooks/useFollowUps'
import { NAV_BY_ROLE } from './navConfig'

const ROLE_INITIAL: Record<string, string> = {
  admin: 'А', dentist: 'Э', follow_up: 'Д', screener: 'Ш',
}


const iconBtn = 'btn flex size-9 items-center justify-center rounded-full text-text-muted transition-all duration-150 hover:bg-surface-raised hover:text-text-base'

const TopBar = () => {
  const pathname = usePathname()
  const { role } = useSession()
  const [dark, setDark] = useState(false)

  const { data: reviewQueue } = useReviewQueue()
  const { data: followUps } = useFollowUps()

  const reviewCount  = reviewQueue?.filter((r) => r.triageLevel === 'red').length ?? 0
  const followupCount = followUps?.filter((f) => f.status === 'flagged').length ?? 0
  const totalNotif   = reviewCount + followupCount
  const badgeCounts: Record<string, number> = { review: reviewCount, followup: followupCount }

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleDark = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('screener.theme', next ? 'dark' : 'light')
    setDark(next)
  }

  const navItems = role ? (NAV_BY_ROLE[role] ?? []) : []

  return (
    <div className="flex h-14 items-center px-5 gap-5">
      {/* Logo */}
      <div className="flex shrink-0 items-center gap-2.5">
        <div
          className="flex size-8 items-center justify-center rounded-xl text-[13px] font-bold"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-fg)' }}
        >
          S
        </div>
        <span className="text-[14px] font-semibold text-text-base tracking-tight">Screener</span>
      </div>

      {/* Nav tabs */}
      <nav className="flex flex-1 items-center justify-center gap-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const count  = item.badgeKey ? (badgeCounts[item.badgeKey] ?? 0) : 0
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`btn flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all duration-150 ${
                active
                  ? 'bg-text-base text-surface shadow-sm'
                  : 'text-text-muted hover:text-text-base'
              }`}
            >
              {item.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none ${
                  active ? 'bg-white/20 text-white' : 'bg-triage-red text-white'
                }`}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Right actions */}
      <div className="flex shrink-0 items-center gap-1">
        <button className={iconBtn} aria-label="Хайх">
          <MagnifyingGlassIcon className="size-4" />
        </button>

        {/* Bell with animated ping when notifications exist */}
        <button className={`${iconBtn} relative`} aria-label={`Мэдэгдэл${totalNotif > 0 ? ` (${totalNotif})` : ''}`}>
          <BellIcon className="size-4" />
          {totalNotif > 0 && (
            <>
              <span className="notif-ping absolute right-1.5 top-1.5 size-2 rounded-full bg-triage-red opacity-75" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-triage-red ring-2 ring-surface" />
            </>
          )}
        </button>

        <button onClick={toggleDark} className={iconBtn} aria-label={dark ? 'Өдрийн горим' : 'Шөнийн горим'}>
          {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
        </button>

        {/* Profile pill */}
        <button className="btn ml-1 flex items-center gap-2 rounded-full border border-border bg-surface-raised px-2.5 py-1.5 transition-all duration-150 hover:border-primary hover:bg-surface">
          <div
            className="flex size-6 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {role ? (ROLE_INITIAL[role] ?? '?') : '?'}
          </div>
          <ChevronDownIcon className="size-3 text-text-muted" />
        </button>
      </div>
    </div>
  )
}

export default TopBar
