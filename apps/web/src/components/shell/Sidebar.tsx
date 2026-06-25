'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useSession } from '@/components/providers'
import { NAV_BY_ROLE } from './navConfig'

const iconBtn = 'btn flex size-11 items-center justify-center rounded-full transition-all duration-150'

const Sidebar = () => {
  const pathname = usePathname()
  const { role, logout } = useSession()
  const navItems = role ? (NAV_BY_ROLE[role] ?? []) : []

  return (
    <div className="flex w-[68px] flex-col items-center py-5 gap-1">
      {/* Lime logo */}
      <div
        className="btn mb-6 flex size-9 cursor-default items-center justify-center rounded-xl text-[15px] font-bold transition-all duration-150"
        style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-fg)' }}
      >
        S
      </div>

      {/* Nav icons */}
      <nav className="flex flex-1 flex-col items-center gap-1.5" aria-label="Үндсэн цэс">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`${iconBtn} ${
                active
                  ? 'bg-text-base text-surface shadow-sm'
                  : 'text-text-muted hover:bg-surface-raised hover:text-text-base'
              }`}
            >
              <item.Icon className="size-[18px]" />
            </Link>
          )
        })}
      </nav>

      {/* Bottom utility */}
      <div className="flex flex-col items-center gap-1.5">
        <button
          title="Тохиргоо"
          aria-label="Тохиргоо"
          className={`${iconBtn} text-text-muted hover:bg-surface-raised hover:text-text-base`}
        >
          <Cog6ToothIcon className="size-[18px]" />
        </button>
        <button
          onClick={logout}
          title="Гарах"
          aria-label="Гарах"
          className={`${iconBtn} text-text-muted hover:bg-triage-red-bg hover:text-triage-red`}
        >
          <ArrowRightOnRectangleIcon className="size-[18px]" />
        </button>
      </div>
    </div>
  )
}

export default Sidebar
