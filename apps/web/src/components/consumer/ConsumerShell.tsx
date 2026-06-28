'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeftRight, Bell, ChevronDown, LogOut, Settings } from '@/lib/icons'
import { ConsumerSearchBox } from '@/components/consumer/ConsumerSearchBox'
import { SidebarToggleIcon } from '@/components/consumer/SidebarToggleIcon'
import { ThemeToggle } from '@/components/consumer/ThemeToggle'
import { useSession } from '@/components/providers'
import { useMe } from '@/hooks/useMe'
import { homeForRole } from '@/lib/auth'
import { HOME_NAV, MAIN_NAV } from '@/lib/nav'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'

const SIDEBAR_EXPANDED = 240
const SIDEBAR_COLLAPSED = 72
const CHROME_H = 68

export const ConsumerShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useSession()
  const { data: me } = useMe()
  const [collapsed, setCollapsed] = useState(true)

  const dashboardHref = me?.role ? homeForRole(me.role) : null
  const hasDashboard = dashboardHref !== null && dashboardHref !== '/home'

  const initial = me?.name?.charAt(0)?.toUpperCase() ?? 'U'
  const displayName = me?.name ?? 'Хэрэглэгч'
  const userTag = me?.id?.slice(0, 8) ?? '—'
  const sidebarW = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

  const navLink = (key: string, href: string, active: boolean, icon: React.ReactNode, label: string) => (
    <Link
      key={key}
      href={href}
      title={label}
      className={cn(
        'flex items-center rounded-full font-semibold transition-all duration-200',
        collapsed ? 'mx-auto size-11 justify-center' : 'w-full gap-3 px-4 py-3 text-[14px]',
        active
          ? 'bg-[#F3B900] text-slate-900 shadow-[0_2px_10px_rgba(243,185,0,0.28)]'
          : 'text-text-muted hover:bg-surface-raised hover:text-text-base',
      )}
    >
      <span className={cn('flex shrink-0 items-center justify-center [&>svg]:size-5', collapsed && 'size-5')}>
        {icon}
      </span>
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </Link>
  )

  const footerLink = (href: string, icon: React.ReactNode, label: string) => (
    <Link
      href={href}
      title={label}
      className={cn(
        'flex items-center text-text-muted transition-colors hover:bg-surface-raised hover:text-text-base',
        collapsed ? 'mx-auto size-10 justify-center rounded-xl' : 'gap-3 rounded-full px-4 py-2.5 text-[13px]',
      )}
    >
      <span className="flex shrink-0 [&>svg]:size-[18px]">{icon}</span>
      {!collapsed ? <span>{label}</span> : null}
    </Link>
  )

  return (
    <div className="consumer-app flex min-h-screen bg-consumer-canvas">
      <aside
        className="consumer-sidebar consumer-chrome sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-border transition-[width] duration-200"
        style={{ width: sidebarW }}
      >
        <div
          className={cn(
            'flex shrink-0 items-center border-b border-border',
            collapsed ? 'justify-center px-2' : 'gap-3 px-5',
          )}
          style={{ height: CHROME_H }}
        >
          <Link
            href={ROUTES.home}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F3B900] text-xs font-bold text-slate-900 shadow-[0_2px_8px_rgba(243,185,0,0.25)]"
          >
            S
          </Link>
          {!collapsed ? (
            <span className="text-[15px] font-bold tracking-wide text-text-base">SCREENER</span>
          ) : null}
        </div>

        <nav className={cn('flex flex-1 flex-col gap-1 overflow-y-auto py-4', collapsed ? 'px-2' : 'px-3')}>
          {navLink('home', HOME_NAV.href, HOME_NAV.match(pathname), <HOME_NAV.Icon strokeWidth={2} />, 'Нүүр')}
          {MAIN_NAV.map(({ id, href, label, Icon, match }) =>
            navLink(id, href, match(pathname), <Icon strokeWidth={2} />, label),
          )}
        </nav>

        <div className={cn('shrink-0 border-t border-border py-4', collapsed ? 'space-y-1 px-2' : 'space-y-0.5 px-3')}>
          {footerLink(ROUTES.profile.settings, <Settings strokeWidth={2} />, 'Тохиргоо')}
          <button
            type="button"
            onClick={logout}
            title="Гарах"
            className={cn(
              'flex w-full items-center text-text-muted transition-colors hover:bg-surface-raised hover:text-text-base',
              collapsed ? 'mx-auto size-10 justify-center rounded-xl' : 'gap-3 rounded-full px-4 py-2.5 text-[13px]',
            )}
          >
            <span className="flex shrink-0 [&>svg]:size-[18px]">
              <LogOut strokeWidth={2} />
            </span>
            {!collapsed ? <span>Гарах</span> : null}
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header
          className="consumer-chrome sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-border px-4 lg:gap-4 lg:px-6"
          style={{ height: CHROME_H }}
        >
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-text-base transition-colors duration-200 hover:bg-surface-raised active:scale-95 [perspective:500px]"
            aria-label={collapsed ? 'Цэс нээх' : 'Цэс хураах'}
            aria-expanded={!collapsed}
          >
            <SidebarToggleIcon collapsed={collapsed} />
          </button>

          <ConsumerSearchBox />

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {hasDashboard && (
              <button
                type="button"
                onClick={() => router.push(dashboardHref!)}
                title="Хяналтын самбар руу очих"
                className="flex size-10 items-center justify-center rounded-full bg-surface text-text-muted shadow-[var(--shadow-card)] ring-1 ring-border transition-all duration-200 hover:text-text-base"
                aria-label="Хяналтын самбар руу очих"
              >
                <ArrowLeftRight className="size-[18px]" strokeWidth={2} />
              </button>
            )}
            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-full bg-surface text-text-muted shadow-[var(--shadow-card)] ring-1 ring-border transition-all duration-200 hover:text-text-base"
              aria-label="Мэдэгдэл"
            >
              <Bell className="size-[18px]" strokeWidth={2} />
              <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[#F3B900]" />
            </button>

            <Link
              href={ROUTES.profile.root}
              className="flex items-center gap-2 rounded-full bg-surface py-1 pl-1 pr-2 shadow-[var(--shadow-card)] ring-1 ring-border transition-all hover:ring-border sm:gap-2.5 sm:pr-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F3B900] text-[13px] font-bold text-slate-900">
                {initial}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-[13px] font-semibold leading-tight text-text-base">{displayName}</span>
                <span className="block text-[11px] leading-tight text-text-muted">{userTag}</span>
              </span>
              <ChevronDown className="hidden size-4 shrink-0 text-text-muted sm:block" strokeWidth={2} />
            </Link>
          </div>
        </header>

        <main className="consumer-main flex-1 px-4 py-6 pb-16 lg:px-6 xl:px-8">{children}</main>
      </div>
    </div>
  )
}
