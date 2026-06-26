'use client'

import { motion } from 'framer-motion'
import { TRIAGE } from './Landing.data'
import { Eyebrow, BigTitle } from './Helpers'

export function Solution() {
  return (
    <section
      id="solution"
      className="slide"
      style={{ padding: '180px 40px 0px', borderTop: '1px solid var(--line)' }}
    >
      <span className="slide-num"> 04 — Шийдэл</span>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          className="grid-2"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: 90,
            alignItems: 'center',
            marginBottom: 0,
          }}
        >
          <div>
            <Eyebrow>Манай шийдэл</Eyebrow>
            <BigTitle>
              Гар утсаар
              <br />
              зураг авч,
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>AI шууд</em>
              <br />
              хариу өгнө.
            </BigTitle>
            <p
              style={{
                fontSize: 17,
                color: 'var(--ink-soft)',
                lineHeight: 1.7,
                marginBottom: 32,
                maxWidth: 460,
              }}
            >
              Эмч биш хүн ч ашиглах боломжтой. Интернэт байхгүй ч ажиллана. Зураг авмагц{' '}
              <strong>3 секундын дотор</strong> ногоон/шар/улаан гэсэн чиглүүлэг гарна.
            </p>
            <p
              style={{
                fontSize: 13,
                color: 'var(--muted)',
                lineHeight: 1.65,
                padding: '16px 20px',
                borderLeft: '3px solid var(--coral)',
                background: 'rgba(232,101,76,0.06)',
                borderRadius: '0 8px 8px 0',
              }}
            >
              <strong style={{ color: 'var(--ink)' }}>Анхаар:</strong> AI-н гаргасан түвшин нь
              <em> оношилгоо биш, чиглүүлэг</em>. Эцсийн шийдвэрийг шүдний эмч гаргана.
            </p>
          </div>
          <div
            style={{
              background: 'var(--paper)',
              borderRadius: 24,
              padding: 32,
              border: '1px solid var(--line)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '1px solid var(--line)',
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4CAF50' }} />
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 14,
                  letterSpacing: '0.15em',
                  color: 'var(--muted)',
                }}
              >
                Tooth Fairy · LIVE
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  color: 'var(--muted)',
                }}
              >
                v1.0
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {TRIAGE.map((t, i) => (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 16,
                    alignItems: 'center',
                    padding: '16px 18px',
                    background: 'var(--bg)',
                    borderRadius: 14,
                    borderLeft: `4px solid ${t.color}`,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{t.emoji}</span>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--display)',
                        fontWeight: 500,
                        fontSize: 19,
                        marginBottom: 2,
                      }}
                    >
                      {t.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.45 }}>
                      {t.body}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      padding: '4px 10px',
                      borderRadius: 999,
                      color: t.color,
                      border: `1px solid ${t.color}40`,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {t.label.toUpperCase()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
