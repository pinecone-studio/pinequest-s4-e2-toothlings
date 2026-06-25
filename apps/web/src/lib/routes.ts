/** Consumer app paths — matches product user-flow diagram. */
export const ROUTES = {
  landing: '/',
  login: '/login',
  home: '/home',

  scan: {
    root: '/scan',
    questionnaire: '/scan/questionnaire',
    camera: '/scan/camera',
    result: '/scan/result',
  },

  doctor: {
    root: '/doctor',
    map: '/doctor/map',
    chat: '/doctor/chat',
  },

  brush: {
    root: '/brush',
    instructions: '/brush/instructions',
    monitor: '/brush/monitor',
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
  emoji: string
}> = [
  {
    id: 'scan',
    href: ROUTES.scan.root,
    label: 'Scan',
    desc: 'Шүдний зураг аваад AI screening',
    emoji: '📷',
  },
  {
    id: 'doctor',
    href: ROUTES.doctor.root,
    label: 'Doctor',
    desc: 'Эмч хайх, чат, байршил',
    emoji: '🩺',
  },
  {
    id: 'brush',
    href: ROUTES.brush.root,
    label: 'Brush',
    desc: 'Угаалгын заавар, smart monitor',
    emoji: '🪥',
  },
  {
    id: 'profile',
    href: ROUTES.profile.root,
    label: 'Profile',
    desc: 'Түүх, тохиргоо, тайлан',
    emoji: '👤',
  },
]
