'use client'

import { motion } from 'framer-motion'
import { FEATURES } from './Landing.data'
import { Eyebrow, BigTitle } from './Helpers'

export function Features() {
  return (
    <section
      id="features"
      className="slide"
      style={{
        padding: '140px 40px 80px',
        borderTop: '1px solid var(--line)',
        background: 'var(--paper)',
      }}
    >
      <span className="slide-num"> 05 — Систем</span>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Eyebrow>System</Eyebrow>
        <BigTitle>
          Нэг систем,
          <br />
          <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>4 хэсэг.</em>
        </BigTitle>
        <p
          style={{
            fontSize: 17,
            color: 'var(--ink-soft)',
            maxWidth: 580,
            marginBottom: 72,
            lineHeight: 1.65,
          }}
        >
          Веб, гар утасны апп, сервер, AI модель — бие даан ажиллаж, сүлжээ орох үед бие биетэйгээ
          синк хийдэг.
        </p>
        <div
          className="grid-2"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.tag}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{
                background: 'var(--bg)',
                borderRadius: 18,
                padding: 40,
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)'
                e.currentTarget.style.transform = ''
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--muted)',
                    letterSpacing: '0.2em',
                    padding: '4px 10px',
                    border: '1px solid var(--line)',
                    borderRadius: 999,
                  }}
                >
                  {f.tag}
                </span>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--bg)',
                    fontSize: 16,
                  }}
                >
                  {['1', '2', '3', '4'][i]}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: 'var(--display)',
                  fontWeight: 500,
                  fontSize: 30,
                  letterSpacing: '-0.02em',
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.7 }}>{f.body}</p>
            </motion.div>
          ))}
        </div>
        <div
          style={{
            marginTop: 72,
            paddingTop: 32,
            borderTop: '1px solid var(--line)',
            overflow: 'hidden',
          }}
        >
          <p className="eyebrow" style={{ marginBottom: 16, color: 'var(--muted)' }}>
            Теch Stack
          </p>
          <div className="marquee-track" style={{ gap: 48 }}>
            {[...Array(2)].map((_, k) =>
              [
                'React Native',
                'TensorFlow Lite',
                'FastAPI',
                'PostgreSQL',
                'On-device ML',
                'Offline-first',
                'WebRTC Telemed',
                'MN Cyrillic',
              ].map((t, i) => (
                <span
                  key={`${k}-${i}`}
                  style={{
                    fontFamily: 'var(--display)',
                    fontWeight: 500,
                    fontSize: 22,
                    color: 'var(--ink-soft)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 48,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t}
                  <span style={{ color: 'var(--coral)', fontSize: 8 }}>●</span>
                </span>
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
