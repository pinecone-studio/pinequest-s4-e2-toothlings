import { Squares2X2Icon, ClipboardDocumentCheckIcon, ClipboardDocumentListIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline'
import type { ComponentType, SVGProps } from 'react'
import type { UserRole } from '@pinequest/types'

export type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>

export type NavItem = {
  href: string
  label: string
  Icon: HeroIcon
  badgeKey?: 'review' | 'followup'
}

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [
    { href: '/admin',       label: 'Самбар',    Icon: Squares2X2Icon },
    { href: '/dentist',     label: 'Шалгалт',   Icon: ClipboardDocumentCheckIcon, badgeKey: 'review' },
    { href: '/follow-up',   label: 'Дагалт',    Icon: ClipboardDocumentListIcon,  badgeKey: 'followup' },
    { href: '/admin/users', label: 'Хэрэглэгч', Icon: UsersIcon },
    { href: '/admin/audit', label: 'Аудит',     Icon: ClockIcon },
  ],
  dentist: [
    { href: '/dentist',   label: 'Шалгалт', Icon: ClipboardDocumentCheckIcon, badgeKey: 'review' },
  ],
  follow_up: [
    { href: '/follow-up', label: 'Дагалт',  Icon: ClipboardDocumentListIcon, badgeKey: 'followup' },
  ],
  screener: [],
}
