import {
  Squares2X2Icon,
  UserIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UsersIcon,
  HandRaisedIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/solid'
import { Camera, ToothBrush } from '@/lib/icons'
import type { ComponentType, SVGProps } from 'react'
import type { UserRole } from '@pinequest/types'
import { BookOpenIcon } from 'lucide-react'

export type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>

export type NavItem = {
  href: string
  label: string
  Icon: HeroIcon
  badgeKey?: 'review' | 'followup'
}

const OVERVIEW: NavItem = { href: '/dashboard', label: 'Мэдээлэл', Icon: Squares2X2Icon }
const SCREENING: NavItem = {
  href: '/dashboard/screening',
  label: 'Screening',
  Icon: Camera as HeroIcon,
}
const BRUSH_NAV: NavItem = {
  href: '/dashboard/brush',
  label: 'Ухаалаг сойз',
  Icon: ToothBrush as HeroIcon,
}
const FOLLOWUP: NavItem = {
  href: '/dashboard/follow-ups',
  label: 'Хяналт',
  Icon: ClipboardDocumentListIcon,
  badgeKey: 'followup',
}
const SUMMARY: NavItem = { href: '/dashboard/summary', label: 'Дүгнэлт', Icon: ChartBarIcon }
const TRENDS: NavItem = { href: '/dashboard/trends', label: 'Динамик', Icon: ArrowTrendingUpIcon }
const TEACHERS: NavItem = { href: '/dashboard/users', label: 'Хэрэглэгчид', Icon: UsersIcon }
const INFORMATION: NavItem = {
  href: '/dashboard/information',
  label: 'Мэдлэг',
  Icon: BookOpenIcon,
}

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [OVERVIEW, SCREENING, BRUSH_NAV, FOLLOWUP, SUMMARY, TRENDS, TEACHERS, INFORMATION],
  school_doctor: [OVERVIEW, SCREENING, BRUSH_NAV, FOLLOWUP, SUMMARY, TRENDS, TEACHERS],
  teacher: [OVERVIEW, SCREENING, BRUSH_NAV, FOLLOWUP, SUMMARY, TRENDS],
  parent: [{ href: '/dashboard/child', label: 'Дүгнэлт', Icon: UserIcon }],
  dentist: [{ href: '/dashboard/dentist/help', label: 'Дуудлага', Icon: HandRaisedIcon }],
  follow_up: [
    { href: '/dashboard/follow-up', label: 'Хяналтын самбар', Icon: ClipboardDocumentListIcon },
  ],
  screener: [OVERVIEW, SCREENING, BRUSH_NAV],
}
