import { Squares2X2Icon, ClipboardDocumentCheckIcon, ClipboardDocumentListIcon, UsersIcon } from '@heroicons/react/24/outline'
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
    { href: '/admin', label: 'Самбар', Icon: Squares2X2Icon },
    { href: '/dentist', label: 'Эмчийн хяналт', Icon: ClipboardDocumentCheckIcon, badgeKey: 'review' },
    { href: '/follow-up', label: 'Дагах', Icon: ClipboardDocumentListIcon, badgeKey: 'followup' },
    { href: '/admin/users', label: 'Хэрэглэгчид', Icon: UsersIcon },
  ],
  dentist: [
    { href: '/dentist', label: 'Хяналтын дараалал', Icon: ClipboardDocumentCheckIcon, badgeKey: 'review' },
  ],
  follow_up: [
    { href: '/follow-up', label: 'Дагах жагсаалт', Icon: ClipboardDocumentListIcon, badgeKey: 'followup' },
  ],
  screener: [],
}
