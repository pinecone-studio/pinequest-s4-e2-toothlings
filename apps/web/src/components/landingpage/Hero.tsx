'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Pill, BigCTA } from './Helpers'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0])

  return (
    <section
      ref={ref}
      id="hero"
      className="slide"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 'auto 20',
        padding: '70px 40px 10px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span className="slide-num mt-10">01 — Танилцуулга</span>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 50% 50% at 85% 30%, rgba(232,101,76,0.10) 0%, transparent 60%),' +
            'radial-gradient(ellipse 60% 50% at 10% 90%, rgba(15,77,63,0.08) 0%, transparent 65%)',
        }}
      />
      <motion.div
        style={{
          y,
          opacity,
          maxWidth: 1100,
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}
        >
          <Pill>🇲🇳 Монгол улс</Pill>
          <Pill>Оффлайн-first</Pill>
          <Pill>AI Triage</Pill>
        </motion.div>
        <h1 className="display" style={{ fontSize: 'clamp(54px, 9vw, 132px)', marginBottom: 36 }}>
          {['Шүдийг', 'гар утасаар'].map((line) => (
            <motion.span
              key={line}
              initial={{ opacity: 0, y: 80, filter: 'blur(16px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
              transition={{ duration: 0.95, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
              style={{ display: 'block' }}
            >
              {line}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, y: 80, filter: 'blur(16px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
            transition={{ duration: 0.95, delay: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ display: 'block', fontStyle: 'italic', color: 'var(--accent)' }}
          >
            шүүн танина.
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.7 }}
          style={{
            fontSize: 19,
            color: 'var(--ink-soft)',
            lineHeight: 1.65,
            maxWidth: 780,
            marginBottom: 44,
          }}
        >
          <strong>Tooth Fairy</strong> — эцэг эх, багш, сумын ажилтан зураг авмагц{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>🟢 / 🟡 / 🔴</span> түвшин
          гаргадаг, оффлайн ажилладаг AI шүүн танигч систем.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}
        >
          <BigCTA href="#solution">Шийдлийг үзэх →</BigCTA>
          <a
            href="#problem"
            className="ulink"
            style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 500 }}
          >
            Эсвэл асуудлыг ойлгох
          </a>
        </motion.div>
      </motion.div>
      <div
        style={{
          marginTop: 72,
          paddingTop: 87,
          borderTop: '1px solid var(--line)',
          overflow: 'hidden',
        }}
      >
        <div className="marquee-track" style={{ gap: 48 }}>
          {[...Array(2)].map((_, k) =>
            [
              'Artificial Intelligence',
              'Healthcare',
              'Dentistry',
              'Coding',
              'Pinecone',
              'Software Engineering',
              'Technology',
              'PineQuest',
              'Team Work',
              'Team 7',
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
    </section>
  )
}
