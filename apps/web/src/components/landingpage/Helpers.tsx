import type { CSSProperties, ReactNode } from 'react'

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 14px',
        borderRadius: 999,
        border: '1px solid var(--line)',
        fontSize: 17,
        fontFamily: 'var(--mono)',
        letterSpacing: '0.1em',
        color: 'var(--ink-soft)',
        background: 'rgba(255,255,255,0.4)',
      }}
    >
      {children}
    </span>
  )
}

export function BigCTA({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '16px 32px',
        borderRadius: 999,
        background: 'var(--ink)',
        color: 'var(--bg)',
        fontWeight: 600,
        fontSize: 15,
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--accent)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--ink)'
        e.currentTarget.style.transform = ''
      }}
    >
      {children}
    </a>
  )
}

export function Eyebrow({
  children,
  style,
  className,
}: {
  children: ReactNode
  style?: CSSProperties
  className?: string
}) {
  return (
    <p
      className={`eyebrow ${className || ''}`}
      style={{ marginBottom: 24, fontSize: 20, ...style }}
    >
      {children}
    </p>
  )
}

export function BigTitle({ children, gap }: { children: ReactNode; gap?: number }) {
  return (
    <h2
      className="display"
      style={{
        fontSize: 'clamp(44px, 7vw, 100px)',
        marginBottom: 32,
        lineHeight: gap ? gap / 10 : undefined,
      }}
    >
      {children}
    </h2>
  )
}

export function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'rgba(244,239,230,0.45)',
          letterSpacing: '0.2em',
          marginBottom: 16,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </p>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {links.map((l) => (
          <li key={l}>
            <a href="#" style={{ fontSize: 14, color: 'rgba(244,239,230,0.8)' }}>
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
