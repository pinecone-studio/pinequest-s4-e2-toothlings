import { useState, useEffect, useRef } from 'react'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  t1: '#48A9B2',
  t2: '#6FC7C8',
  t3: '#57BDC1',
  t4: '#3B5B58',
  bg: '#0a0f0f',
  bg2: '#0d1515',
  bg3: '#101a1a',
  w: '#ffffff',
  mu: '#6b8f8f',
  border: 'rgba(72,169,178,0.15)',
  dim: 'rgba(72,169,178,0.12)',
} as const

// ── Fade-in hook ──────────────────────────────────────────────────────────────
function useFade(delay = 0) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setOn(true)
      },
      { threshold: 0.1 },
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return {
    ref,
    style: {
      opacity: on ? 1 : 0,
      transform: on ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
    } as React.CSSProperties,
  }
}

function FI({
  children,
  delay = 0,
  style = {},
}: {
  children: React.ReactNode
  delay?: number
  style?: React.CSSProperties
}) {
  const fade = useFade(delay)
  return (
    <div ref={fade.ref} style={{ ...fade.style, ...style }}>
      {children}
    </div>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const links = ['Асуудал', 'Шийдэл', 'Систем', 'Үр нөлөө']
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2.5rem',
        background: scrolled ? 'rgba(10,15,15,0.97)' : 'rgba(10,15,15,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? C.border : 'transparent'}`,
        transition: 'all .3s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: C.t1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 900,
            color: '#071010',
          }}
        >
          S
        </div>
        <span style={{ fontWeight: 800, fontSize: '.92rem', color: C.w, letterSpacing: '-.03em' }}>
          SCREENER
        </span>
      </div>
      <div style={{ display: 'flex', gap: '1.8rem', alignItems: 'center' }}>
        {links.map((l) => (
          <a
            key={l}
            href={`#${l}`}
            style={{
              color: C.mu,
              textDecoration: 'none',
              fontSize: '.78rem',
              transition: 'color .2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = C.t2)}
            onMouseOut={(e) => (e.currentTarget.style.color = C.mu)}
          >
            {l}
          </a>
        ))}
        <button
          style={{
            background: C.t1,
            color: '#071010',
            fontWeight: 700,
            padding: '.4rem 1.1rem',
            borderRadius: 6,
            border: 'none',
            fontSize: '.76rem',
            cursor: 'pointer',
            transition: 'background .2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = C.t2)}
          onMouseOut={(e) => (e.currentTarget.style.background = C.t1)}
        >
          Татаж авах
        </button>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const btnHover = (bg: string) => ({
    onMouseOver: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background = bg
      e.currentTarget.style.transform = 'translateY(-1px)'
    },
    onMouseOut: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background = ''
      e.currentTarget.style.transform = ''
    },
  })
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '8rem 2rem 5rem',
        background: C.bg,
      }}
    >
      <FI>
        <div
          style={{
            fontSize: '.66rem',
            fontWeight: 700,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: C.t1,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: 'center',
          }}
        >
          <span style={{ display: 'block', width: 22, height: 1, background: C.t4 }} />
          AI · Эрүүл мэнд · Монгол улс
          <span style={{ display: 'block', width: 22, height: 1, background: C.t4 }} />
        </div>
      </FI>
      <FI delay={100}>
        <h1
          style={{
            fontSize: 'clamp(3rem,7.5vw,5.8rem)',
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: '-.05em',
            color: C.w,
            marginBottom: '1.2rem',
          }}
        >
          Хүүхдийн шүд.
          <br />
          <span style={{ color: C.t2 }}>Эрт илрүүлэг.</span>
        </h1>
      </FI>
      <FI delay={200}>
        <p
          style={{
            fontSize: '1rem',
            color: C.mu,
            maxWidth: 480,
            lineHeight: 1.8,
            margin: '0 auto 2.5rem',
          }}
        >
          Гар утасны камер ба AI-аар амны хөндийн анхан шатны шүүн тайлал хийдэг, offline-first
          систем — хөдөө орон нутагт ч ажилладаг.
        </p>
      </FI>
      <FI delay={280}>
        <div
          style={{
            display: 'flex',
            gap: '.85rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '4.5rem',
          }}
        >
          <button
            style={{
              background: C.t1,
              color: '#071010',
              fontWeight: 700,
              padding: '.72rem 1.8rem',
              borderRadius: 6,
              border: 'none',
              fontSize: '.88rem',
              cursor: 'pointer',
              transition: 'all .2s',
            }}
            {...btnHover(C.t2)}
          >
            Аппыг татах →
          </button>
          <button
            style={{
              background: 'transparent',
              color: C.t2,
              border: `1px solid ${C.t4}`,
              padding: '.72rem 1.8rem',
              borderRadius: 6,
              fontSize: '.88rem',
              cursor: 'pointer',
              transition: 'all .2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = C.t2
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = C.t4
              e.currentTarget.style.transform = ''
            }}
          >
            Дэлгэрэнгүй
          </button>
        </div>
      </FI>
      <FI delay={360}>
        <div
          style={{
            display: 'flex',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {[
            ['Offline', 'Интернэтгүй'],
            ['3', 'Үнэлгээний түвшин'],
            ['24/7', 'Эмчтэй холбоо'],
            ['AI', 'Шуурхай тайлал'],
          ].map(([n, l], i) => (
            <div
              key={i}
              style={{
                padding: '1.2rem 2rem',
                textAlign: 'center',
                borderRight: i < 3 ? `1px solid ${C.border}` : 'none',
              }}
            >
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  color: C.t2,
                  letterSpacing: '-.04em',
                }}
              >
                {n}
              </div>
              <div
                style={{
                  fontSize: '.62rem',
                  color: C.mu,
                  marginTop: 3,
                  letterSpacing: '.03em',
                  textTransform: 'uppercase',
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </FI>
    </section>
  )
}

// ── Marquee ───────────────────────────────────────────────────────────────────
function Marquee() {
  const items = [
    'Offline-First',
    'AI Triage',
    'Гар утас',
    'Веб платформ',
    'Хөдөө орон нутаг',
    'Эрт илрүүлэг',
    'Мэргэжлийн бус хэрэглэгч',
    'Screener',
  ]
  const all = [...items, ...items]
  return (
    <div
      style={{
        overflow: 'hidden',
        padding: '.9rem 0',
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        background: C.bg2,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '2.5rem',
          width: 'max-content',
          animation: 'marq 22s linear infinite',
        }}
      >
        {all.map((t, i) => (
          <span
            key={i}
            style={{
              fontSize: '.68rem',
              color: i % 2 === 1 ? 'rgba(111,199,200,.5)' : C.mu,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              fontWeight: i % 2 === 1 ? 600 : 400,
            }}
          >
            {t} &nbsp;·
          </span>
        ))}
      </div>
      <style>{`@keyframes marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  )
}

// ── Shared section wrapper ────────────────────────────────────────────────────
function Sec({
  children,
  id,
  bg = C.bg,
  border = false,
}: {
  children: React.ReactNode
  id?: string
  bg?: string
  border?: boolean
}) {
  return (
    <div
      id={id}
      style={{
        background: bg,
        padding: '6rem 2rem',
        borderTop: border ? `1px solid ${C.border}` : 'none',
        borderBottom: border ? `1px solid ${C.border}` : 'none',
      }}
    >
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>{children}</div>
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '.64rem',
        fontWeight: 700,
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        color: C.t1,
        marginBottom: '.7rem',
      }}
    >
      {children}
    </div>
  )
}
function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 'clamp(1.85rem,4vw,2.7rem)',
        fontWeight: 900,
        color: C.w,
        letterSpacing: '-.05em',
        lineHeight: 1.05,
        marginBottom: '1rem',
      }}
    >
      {children}
    </h2>
  )
}

// ── Problem ───────────────────────────────────────────────────────────────────
function Problem() {
  const cards = [
    {
      n: '01',
      title: 'Хязгаарлагдмал хүртээмж',
      desc: 'Сум, хөдөө орон нутагт шүдний мэргэжлийн эмч, эмнэлгийн хүртээмж маш дутагдалтай.',
    },
    {
      n: '02',
      title: 'Хожуу илрүүлэг',
      desc: 'Хүүхдийн шүдний цоорол хүндэрсэн хойноо оношлогддог — эрт шатандаа илрэхгүй явдаг.',
    },
    {
      n: '03',
      title: 'Мэдээллийн хоцрогдол',
      desc: 'Хөдөөгийн хүн амд шүдний эрүүл мэндийн боловсрол, урьдчилан сэргийлэх үзлэг хүрдэггүй.',
    },
  ]
  return (
    <Sec id="Асуудал">
      <FI>
        <Eyebrow>Өнөөгийн нөхцөл байдал</Eyebrow>
      </FI>
      <FI delay={80}>
        <H2>
          Яагаад шийдэл
          <br />
          хэрэгтэй вэ?
        </H2>
      </FI>
      <FI delay={140}>
        <p
          style={{
            fontSize: '.88rem',
            color: C.mu,
            lineHeight: 1.8,
            maxWidth: 460,
            marginBottom: '2.5rem',
          }}
        >
          Монгол улсын хөдөө орон нутагт хүүхдийн шүдний эрүүл мэндэд гурван том саад тулгарч байна.
        </p>
      </FI>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))',
          gap: 1,
          background: C.border,
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${C.border}`,
        }}
      >
        {cards.map((c, i) => (
          <FI key={i} delay={i * 80}>
            <div
              style={{
                background: C.bg2,
                padding: '2rem',
                transition: 'background .25s',
                height: '100%',
              }}
              onMouseOver={(e) => ((e.currentTarget as HTMLDivElement).style.background = C.bg3)}
              onMouseOut={(e) => ((e.currentTarget as HTMLDivElement).style.background = C.bg2)}
            >
              <div
                style={{
                  fontSize: '.58rem',
                  fontWeight: 700,
                  letterSpacing: '.1em',
                  color: C.t4,
                  textTransform: 'uppercase',
                  marginBottom: '1.1rem',
                }}
              >
                Асуудал {c.n}
              </div>
              <div
                style={{ fontSize: '.98rem', fontWeight: 700, color: C.w, marginBottom: '.55rem' }}
              >
                {c.title}
              </div>
              <div style={{ fontSize: '.82rem', color: C.mu, lineHeight: 1.72 }}>{c.desc}</div>
            </div>
          </FI>
        ))}
      </div>
    </Sec>
  )
}

// ── Solution ──────────────────────────────────────────────────────────────────
function Solution() {
  const feats = [
    ['Offline-First', 'интернэтгүй алслагдсан сум, багт хэвийн ажиллана'],
    ['Хэн ч хэрэглэж болно', 'эцэг эх, багш, сумын эрүүл мэндийн ажилтан'],
    ['Шууд үр дүн', 'зураг авснаас хойш секундын дотор тайлал'],
    ['Эмчтэй холбох', 'улаан түвшинд шууд мэргэжилтэнтэй холбогдоно'],
  ]
  return (
    <Sec id="Шийдэл" bg={C.bg2} border>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '5rem',
          alignItems: 'center',
        }}
      >
        <div>
          <FI>
            <Eyebrow>Технологийн шийдэл</Eyebrow>
          </FI>
          <FI delay={80}>
            <H2>
              Screener
              <br />
              гэж юу вэ?
            </H2>
          </FI>
          <FI delay={140}>
            <p style={{ fontSize: '.88rem', color: C.mu, lineHeight: 1.8, marginBottom: '1.5rem' }}>
              Гар утасны камераар хүүхдийн амны хөндийн зургийг авч, AI-аар анхан шатны шүүн тайлал
              хийдэг систем.
            </p>
          </FI>
          <FI delay={200}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
              {feats.map(([b, s], i) => (
                <div key={i} style={{ display: 'flex', gap: '.8rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 17,
                      height: 17,
                      minWidth: 17,
                      borderRadius: 4,
                      background: C.t4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 2,
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke={C.t2}
                      strokeWidth="2.5"
                    >
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '.83rem', color: C.mu, lineHeight: 1.65 }}>
                    <span style={{ color: C.w, fontWeight: 600 }}>{b}</span> — {s}
                  </div>
                </div>
              ))}
            </div>
          </FI>
        </div>
        <FI delay={160}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: 200,
                background: '#080f0f',
                border: `1.5px solid ${C.border}`,
                borderRadius: 26,
                padding: '1.2rem .85rem',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 4,
                  background: C.dim,
                  borderRadius: 2,
                  margin: '0 auto 1.2rem',
                }}
              />
              <div style={{ textAlign: 'center', marginBottom: '.85rem' }}>
                <div
                  style={{
                    fontSize: '.56rem',
                    fontWeight: 800,
                    color: C.t1,
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  SCREENER
                </div>
                <div style={{ fontSize: '.6rem', color: C.mu, marginTop: 2 }}>
                  Амны хөндийг чиглүүл
                </div>
              </div>
              <div
                style={{
                  background: '#040b0b',
                  borderRadius: 8,
                  height: 110,
                  border: `1px dashed ${C.t4}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 5,
                  marginBottom: '.85rem',
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>📷</div>
                <div style={{ fontSize: '.56rem', color: C.mu }}>Зураг авах</div>
              </div>
              <div
                style={{
                  background: 'rgba(72,169,178,.07)',
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: '.6rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '.95rem' }}>🟢</div>
                <div style={{ fontSize: '.63rem', fontWeight: 700, color: C.t2, marginTop: 3 }}>
                  Хэвийн байдал
                </div>
                <div style={{ fontSize: '.54rem', color: C.mu, marginTop: 2 }}>
                  Урьдчилан сэргийлэх зөвлөмж дагах
                </div>
              </div>
            </div>
          </div>
        </FI>
      </div>
    </Sec>
  )
}

// ── Impact ────────────────────────────────────────────────────────────────────
function Impact() {
  const items = [
    {
      icon: '🎯',
      title: 'Эрт илрүүлэг',
      desc: 'Хөдөө орон нутгийн хүүхдүүдийн шүдний өвчлөлийг хүндрэхээс нь өмнө илрүүлнэ.',
    },
    {
      icon: '💰',
      title: 'Зардал хэмнэлт',
      desc: 'Эцэг эхчүүдийн шаардлагагүй зорчих зардал, цаг хугацааг хэмнэнэ.',
    },
    {
      icon: '🌐',
      title: 'Хүртээмжтэй тусламж',
      desc: 'AI технологиор хот, хөдөөгийн эрүүл мэндийн үйлчилгээний ялгааг арилгана.',
    },
  ]
  return (
    <Sec id="Үр нөлөө">
      <FI>
        <Eyebrow>Төслийн үр нөлөө</Eyebrow>
      </FI>
      <FI delay={80}>
        <H2>
          Хүүхэд бүрд
          <br />
          хүртээмжтэй
        </H2>
      </FI>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))',
          gap: '1.2rem',
          marginTop: '2.5rem',
        }}
      >
        {items.map((item, i) => (
          <FI key={i} delay={i * 100}>
            <div
              style={{
                background: C.bg2,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: '2rem',
                transition: 'border-color .25s, transform .25s',
              }}
              onMouseOver={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = C.t4
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
              }}
              onMouseOut={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = C.border
                ;(e.currentTarget as HTMLDivElement).style.transform = ''
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{item.icon}</div>
              <div
                style={{ fontSize: '.95rem', fontWeight: 700, color: C.w, marginBottom: '.5rem' }}
              >
                {item.title}
              </div>
              <div style={{ fontSize: '.82rem', color: C.mu, lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          </FI>
        ))}
      </div>
    </Sec>
  )
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <div
      style={{
        background: C.bg2,
        padding: '9rem 2rem',
        textAlign: 'center',
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <FI>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div
            style={{
              fontSize: '.64rem',
              fontWeight: 700,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: C.t1,
              marginBottom: '.7rem',
            }}
          >
            Эхлэцгээе
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.2rem,5vw,3.4rem)',
              fontWeight: 900,
              letterSpacing: '-.05em',
              color: C.w,
              lineHeight: 1,
              marginBottom: '1.2rem',
            }}
          >
            Хүүхдийн эрүүл мэндэд
            <br />
            <span style={{ color: C.t2 }}>хөрөнгө оруул.</span>
          </h2>
          <p style={{ fontSize: '.9rem', color: C.mu, lineHeight: 1.8, marginBottom: '2.2rem' }}>
            Screener нь Монголын хөдөөгийн хүүхдэд зориулсан, offline-first, AI-д суурилсан анхан
            шатны оношилгооны шийдэл юм.
          </p>
          <button
            style={{
              background: C.t1,
              color: '#071010',
              fontWeight: 700,
              padding: '.82rem 2.2rem',
              borderRadius: 6,
              border: 'none',
              fontSize: '.9rem',
              cursor: 'pointer',
              transition: 'all .2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = C.t2
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = C.t1
              e.currentTarget.style.transform = ''
            }}
          >
            Аппыг татаж авах →
          </button>
        </div>
      </FI>
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${C.border}`,
        padding: '1.8rem 2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        background: C.bg,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            background: C.t1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 900,
            color: '#071010',
          }}
        >
          S
        </div>
        <span style={{ fontWeight: 800, fontSize: '.78rem', color: C.w, letterSpacing: '-.02em' }}>
          SCREENER
        </span>
      </div>
      <div style={{ fontSize: '.66rem', color: C.mu }}>
        AI-д суурилсан амны хөндийн шүүн таних систем · Монгол улс
      </div>
    </footer>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function TestLanding() {
  return (
    <div
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: C.bg,
        overflowX: 'hidden',
      }}
    >
      <Nav />
      <Hero />
      <Marquee />
      <Problem />
      <Solution />
      <Impact />
      <CTA />
      <Footer />
    </div>
  )
}
