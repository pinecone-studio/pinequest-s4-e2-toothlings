import { Squares2X2Icon, ClipboardDocumentCheckIcon, ClipboardDocumentListIcon, UsersIcon, ClockIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline'
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
    { href: '/dashboard/admin',         label: 'Мэдээлэл',    Icon: Squares2X2Icon },
    { href: '/dashboard/admin/cohorts', label: 'Сургууль',  Icon: BuildingLibraryIcon },
    { href: '/dashboard/dentist',       label: 'Хяналт',   Icon: ClipboardDocumentCheckIcon, badgeKey: 'review' },
    { href: '/dashboard/follow-up',     label: 'Хяналт',    Icon: ClipboardDocumentListIcon,  badgeKey: 'followup' },
    { href: '/dashboard/admin/users',   label: 'Хэрэглэгч', Icon: UsersIcon },
    { href: '/dashboard/admin/audit',   label: 'Нийт',     Icon: ClockIcon },
  ],
  dentist: [
    { href: '/dashboard/dentist',   label: 'Шалгалт', Icon: ClipboardDocumentCheckIcon, badgeKey: 'review' },
  ],
  follow_up: [
    { href: '/dashboard/follow-up', label: 'Дагалт',  Icon: ClipboardDocumentListIcon, badgeKey: 'followup' },
  ],
  screener: [],
}
