'use client'

import { motion } from 'framer-motion'
import { PROBLEMS } from './Landing.data'
import { Eyebrow } from './Helpers'

export function Problem() {
  return (
    <section
      id="problem"
      className="slide"
      style={{
        padding: '140px 40px 80px',
        borderTop: '1px solid var(--line)',
        background: 'var(--ink)',
        color: 'var(--bg)',
      }}
    >
      <span className="slide-num" style={{ color: 'rgba(244,239,230,0.4)' }}>
        03 — Асуудал
      </span>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Eyebrow style={{ color: 'var(--coral)' }}>Бодит байдал</Eyebrow>
        <h2 className="display" style={{ fontSize: 'clamp(44px, 7vw, 100px)', marginBottom: 48 }}>
          Сумын хүүхдүүд
          <br />
          эмчид хүрэхгүй
          <br />
          <em style={{ fontStyle: 'italic', color: 'var(--coral)' }}>удаашрах нь</em>
        </h2>
        <p
          style={{
            fontSize: 19,
            color: 'rgba(244,239,230,0.7)',
            maxWidth: 640,
            marginBottom: 80,
            lineHeight: 1.7,
          }}
        >
          Монголын алслагдсан суманд шүдний эмчийн хүртээмж туйлын бага. Хүүхдийн шүдний цоорол эрт
          илрэхгүй, эмчилгээ оройтож, шүд унах, амьдралын чанар буурахад хүргэдэг.
        </p>
        <div
          className="grid-2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 24,
            borderTop: '1px solid rgba(244,239,230,0.15)',
            paddingTop: 48,
          }}
        >
          {PROBLEMS.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div
                className="display"
                style={{
                  fontSize: 'clamp(48px, 6vw, 90px)',
                  color: 'var(--coral)',
                  marginBottom: 16,
                  fontWeight: 500,
                }}
              >
                {p.stat}
              </div>
              <p
                style={{
                  fontSize: 18,
                  color: 'var(--bg)',
                  fontWeight: 500,
                  marginBottom: 8,
                  lineHeight: 1.4,
                }}
              >
                {p.label}
              </p>
              <p style={{ fontSize: 15, color: 'rgba(244,239,230,0.55)', lineHeight: 1.6 }}>
                {p.note}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
