import {
  Squares2X2Icon,
  UserIcon,
  MagnifyingGlassCircleIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UsersIcon,
  HandRaisedIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType, SVGProps } from 'react'
import type { UserRole } from '@pinequest/types'

export type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>

export type NavItem = {
  href: string
  label: string
  Icon: HeroIcon
  badgeKey?: 'review' | 'followup'
}

// Role-scoped navigation. Same board shell, different items + data scope per role:
//   school_doctor → whole school (all classes + teachers)
//   teacher       → their own class(es)
//   parent        → only their own child
// Server-side scope enforcement is the real boundary; this only shapes the UI.
const OVERVIEW: NavItem = { href: '/dashboard/admin', label: 'Мэдээлэл', Icon: Squares2X2Icon }
const COHORTS: NavItem = { href: '/dashboard/admin/cohorts', label: 'Шинжилгээ', Icon: MagnifyingGlassCircleIcon }
const FOLLOWUP: NavItem = { href: '/dashboard/admin/follow-up', label: 'Хяналт', Icon: ClipboardDocumentListIcon, badgeKey: 'followup' }
const SUMMARY: NavItem = { href: '/dashboard/admin/summary', label: 'Дүгнэлт', Icon: ChartBarIcon }
const TRENDS: NavItem = { href: '/dashboard/admin/trends', label: 'Харьцуулалт', Icon: ArrowTrendingUpIcon }
const TEACHERS: NavItem = { href: '/dashboard/admin/users', label: 'Хэрэглэгчид', Icon: UsersIcon }

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [OVERVIEW, COHORTS, FOLLOWUP, SUMMARY, TRENDS, TEACHERS],
  school_doctor: [OVERVIEW, COHORTS, FOLLOWUP, SUMMARY, TRENDS, TEACHERS],
  teacher: [OVERVIEW, COHORTS, FOLLOWUP, SUMMARY, TRENDS],
  parent: [
    { href: '/dashboard/admin/child', label: 'Хүүхэд', Icon: UserIcon },
  ],
  dentist: [
    { href: '/dashboard/dentist', label: 'Шалгалт', Icon: ClipboardDocumentCheckIcon, badgeKey: 'review' },
    { href: '/dashboard/dentist/help', label: 'Тусламж', Icon: HandRaisedIcon },
  ],
  follow_up: [{ href: '/dashboard/follow-up', label: 'Хяналтын самбар', Icon: ClipboardDocumentListIcon }],
  screener: [], // capture app only — no board nav
}
