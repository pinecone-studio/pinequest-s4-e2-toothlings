import type { ComponentType, SVGProps } from 'react'
import { CameraIcon, PhoneIcon, SparklesIcon, UserIcon } from '@heroicons/react/24/solid'

/** Consumer app paths — matches product user-flow diagram. */
export const ROUTES = {
  landing: '/',
  // /login + /register pages were removed — auth is an overlay on the landing.
  login: '/?auth=1',
  home: '/home',

  scan: {
    root: '/scan',
    questionnaire: '/scan/questionnaire',
  questionnaireRetake: '/scan/questionnaire?retake=1',
    camera: '/scan/camera',
    result: '/scan/result',
  },

  doctor: {
    root: '/doctor',
    map: '/doctor?view=map',
    chat: '/doctor/chat',
    chatWith: (id: string) => `/doctor/chat?doctor=${encodeURIComponent(id)}`,
  },

  brush: {
    root: '/brush',
    instructions: '/brush?tab=instructions',
    monitor: '/brush?tab=monitor',
  },

  profile: {
    root: '/profile',
    history: '/profile#history',
    settings: '/profile#settings',
    export: '/profile#export',
  },
} as const

export type HomeFeature = 'scan' | 'doctor' | 'brush' | 'profile'

export const HOME_FEATURES: Array<{
  id: HomeFeature
  href: string
  label: string
  desc: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}> = [
  {
    id: 'scan',
    href: ROUTES.scan.root,
    label: 'Screening',
    desc: 'Амны хөндийн зургийг танин, дүгнэлт хийх',
    Icon: CameraIcon,
  },
  {
    id: 'doctor',
    href: ROUTES.doctor.root,
    label: 'Дуудлага',
    desc: 'Эмч, чат, ойрын эмнэлэг',
    Icon: PhoneIcon,
  },
  {
    id: 'brush',
    href: ROUTES.brush.root,
    label: 'Шүд угаалт',
    desc: 'Шүд угаах зөв арга ба ухаалаг хяналт',
    Icon: SparklesIcon,
  },
  {
    id: 'profile',
    href: ROUTES.profile.root,
    label: 'Тохиргоо',
    desc: 'Түүх, тохиргоо, динамик',
    Icon: UserIcon,
  },
]
