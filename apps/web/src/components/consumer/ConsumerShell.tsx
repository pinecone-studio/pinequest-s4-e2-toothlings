'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Bell, ChevronDown, LogOut, Menu, Search, Settings } from '@/lib/icons'
import { useSession } from '@/components/providers'
import { useMe } from '@/hooks/useMe'
import { HOME_NAV, MAIN_NAV } from '@/lib/nav'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'

const SIDEBAR_EXPANDED = 240
const SIDEBAR_COLLAPSED = 72

export const ConsumerShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const { logout } = useSession()
  const { data: me } = useMe()
  const [collapsed, setCollapsed] = useState(false)

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
          : 'text-slate-600 hover:bg-white/70 hover:text-slate-900',
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
        'flex items-center text-slate-500 transition-colors hover:text-slate-800',
        collapsed ? 'mx-auto size-10 justify-center rounded-xl hover:bg-white/70' : 'gap-3 rounded-full px-4 py-2.5 text-[13px] hover:bg-white/60',
      )}
    >
      <span className="flex shrink-0 [&>svg]:size-[18px]">{icon}</span>
      {!collapsed ? <span>{label}</span> : null}
    </Link>
  )

  return (
    <div className="consumer-app flex min-h-screen bg-[#FAF8F5]">
      <aside
        className="consumer-sidebar consumer-chrome sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r transition-[width] duration-200"
        style={{ width: sidebarW }}
      >
        <div className={cn('flex shrink-0 items-center border-b border-[#E8E4DA]/80', collapsed ? 'justify-center px-2 py-5' : 'gap-3 px-5 py-5')}>
          <Link
            href={ROUTES.home}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F3B900] text-xs font-bold text-slate-900 shadow-[0_2px_8px_rgba(243,185,0,0.25)]"
          >
            S
          </Link>
          {!collapsed ? (
            <span className="text-[15px] font-bold tracking-wide text-slate-900">SCREENER</span>
          ) : null}
        </div>

        <nav className={cn('flex flex-1 flex-col gap-1 overflow-y-auto py-4', collapsed ? 'px-2' : 'px-3')}>
          {navLink('home', HOME_NAV.href, HOME_NAV.match(pathname), <HOME_NAV.Icon strokeWidth={2} />, 'Нүүр')}
          {MAIN_NAV.map(({ id, href, label, Icon, match }) =>
            navLink(id, href, match(pathname), <Icon strokeWidth={2} />, label),
          )}
        </nav>

        <div className={cn('shrink-0 border-t border-[#E8E4DA]/80 py-4', collapsed ? 'space-y-1 px-2' : 'space-y-0.5 px-3')}>
          {footerLink(ROUTES.profile.settings, <Settings strokeWidth={2} />, 'Тохиргоо')}
          <button
            type="button"
            onClick={logout}
            title="Гарах"
            className={cn(
              'flex w-full items-center text-slate-500 transition-colors hover:text-slate-800',
              collapsed ? 'mx-auto size-10 justify-center rounded-xl hover:bg-white/70' : 'gap-3 rounded-full px-4 py-2.5 text-[13px] hover:bg-white/60',
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
        <header className="consumer-chrome sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b px-4 lg:gap-4 lg:px-6">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-white/70 hover:text-slate-900"
            aria-label={collapsed ? 'Цэс нээх' : 'Цэс хураах'}
          >
            <Menu className="size-5" strokeWidth={2} />
          </button>

          <form
            className="relative min-w-0 flex-1 max-w-xl"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <input
              type="search"
              placeholder="Хайх..."
              className="consumer-input w-full py-2.5 pl-4 pr-11 text-[14px]"
            />
            <Search className="pointer-events-none absolute right-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" strokeWidth={2} />
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-1 ring-[#E8E4DA] transition-all duration-200 hover:text-slate-800"
              aria-label="Мэдэгдэл"
            >
              <Bell className="size-[18px]" strokeWidth={2} />
              <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[#F3B900]" />
            </button>

            <Link
              href={ROUTES.profile.root}
              className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-1 ring-[#E8E4DA] transition-all hover:ring-[#E8E4DA]/80 sm:gap-2.5 sm:pr-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F3B900] text-[13px] font-bold text-slate-900">
                {initial}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-[13px] font-semibold leading-tight text-slate-900">{displayName}</span>
                <span className="block text-[11px] leading-tight text-slate-500">{userTag}</span>
              </span>
              <ChevronDown className="hidden size-4 shrink-0 text-slate-400 sm:block" strokeWidth={2} />
            </Link>
          </div>
        </header>

        <main className="consumer-main flex-1 px-4 py-6 pb-16 lg:px-6 xl:px-8">{children}</main>
      </div>
    </div>
  )
}
