import type { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }

const base = (size = 24, strokeWidth = 2, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
})

export const Home = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

export const ScanLine = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
  </svg>
)

export const Stethoscope = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="M4.8 2.3A2 2 0 0 0 3 4v8a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1" />
    <path d="M8 15v1a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
)

export const Sparkles = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="m12 3-1.9 5.8H4.2l4.9 3.6-1.9 5.8L12 14.6l4.8 3.6-1.9-5.8 4.9-3.6h-5.9L12 3z" />
  </svg>
)

export const UserRound = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </svg>
)

export const Bell = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
)

export const LogOut = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)

export const Settings = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const Camera = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
)

export const Upload = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
)

export const Eraser = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
    <path d="M22 21H7" />
    <path d="m5 11 9 9" />
  </svg>
)

export const AlertTriangle = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
)

export const ArrowLeft = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
)

export const FileDown = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M12 18v-6" />
    <path d="m9 15 3 3 3-3" />
  </svg>
)

export const History = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="M3 3v5h5" />
    <path d="M3.05 13A9 9 0 1 0 6 5.3" />
    <path d="M12 7v5l4 2" />
  </svg>
)

export const Menu = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
)

export const Search = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

export const ChevronDown = ({ size, strokeWidth, className, ...rest }: IconProps) => (
  <svg {...base(size, strokeWidth, className)} {...rest}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export type LucideIcon = typeof Home
