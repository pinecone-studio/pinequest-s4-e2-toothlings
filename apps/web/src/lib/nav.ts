import type { LucideIcon } from '@/lib/icons'
import { Home, ScanLine, Stethoscope, Sparkles, UserRound } from '@/lib/icons'
import { ROUTES, type HomeFeature } from '@/lib/routes'

export type NavIcon = LucideIcon

export const MAIN_NAV: Array<{
  id: HomeFeature
  href: string
  label: string
  desc: string
  Icon: NavIcon
  match: (path: string) => boolean
}> = [
  {
    id: 'scan',
    href: ROUTES.scan.camera,
    label: 'Scan',
    desc: 'AI detector',
    Icon: ScanLine,
    match: (p) => p.startsWith('/scan'),
  },
  {
    id: 'doctor',
    href: ROUTES.doctor.root,
    label: 'Doctor',
    desc: 'Эмч, чат',
    Icon: Stethoscope,
    match: (p) => p.startsWith('/doctor'),
  },
  {
    id: 'brush',
    href: ROUTES.brush.root,
    label: 'Brush',
    desc: 'Smart monitor',
    Icon: Sparkles,
    match: (p) => p.startsWith('/brush'),
  },
  {
    id: 'profile',
    href: ROUTES.profile.root,
    label: 'Profile',
    desc: 'Түүх',
    Icon: UserRound,
    match: (p) => p.startsWith('/profile'),
  },
]

export const HOME_NAV = {
  href: ROUTES.home,
  label: 'Home',
  Icon: Home,
  match: (p: string) => p === '/home',
}

export { ROUTES, HOME_FEATURES } from '@/lib/routes'
export type { HomeFeature } from '@/lib/routes'
