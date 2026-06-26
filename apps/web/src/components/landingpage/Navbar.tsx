import Link from 'next/link'
import { NAV } from './Landing.data'

export function Navbar({ active }: { active: number }) {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 140,
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(244, 239, 230, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <a href="#hero" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <img
          src="/logo.png"
          alt="Tooth Fairy"
          style={{ width: 90, height: 65, objectFit: 'contain', display: 'block' }}
        />
        <div>
          <div
            style={{ fontFamily: 'var(--display)', fontWeight: 500, fontSize: 22, lineHeight: 2 }}
          >
            Tooth Fairy
          </div>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 13,
              color: 'var(--muted)',
              letterSpacing: '0.2em',
              marginTop: 2,
            }}
          >
            DENTAL AI · MN
          </div>
        </div>
      </a>
      <ul
        className="nav-links"
        style={{ display: 'flex', gap: 32, listStyle: 'none', margin: 0, padding: 0 }}
      >
        {NAV.map((l, i) => (
          <li key={l.label}>
            <a
              href={l.href}
              style={{
                fontSize: 16,
                fontWeight: 500,
                transition: 'color 0.2s',
                color: active === i ? 'var(--accent)' : 'var(--ink-soft)',
              }}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 17,
            color: 'var(--muted)',
            letterSpacing: '0.2em',
          }}
        >
          {String(active + 1).padStart(2, '0')} / {String(NAV.length).padStart(2, '0')}
        </span>
        <Link
          href="/dashboard"
          style={{
            padding: '10px 20px',
            borderRadius: 999,
            background: 'var(--ink)',
            color: 'var(--bg)',
            fontWeight: 600,
            fontSize: 17,
          }}
        >
          Эхлэх
        </Link>
      </div>
    </nav>
  )
}
