'use client'

import { motion } from 'framer-motion'
import { TEAM } from './Landing.data'
import { Eyebrow, BigTitle } from './Helpers'

export function Team() {
  return (
    <section
      id="team"
      className="slide"
      style={{
        padding: '140px 40px 80px',
        borderTop: '1px solid var(--line)',
        background: 'var(--paper)',
      }}
    >
      <span className="slide-num"> 02 — Баг</span>
      <div
        style={{
          padding: '0 20px',
          margin: 'auto 10px',
          gap: 32,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Eyebrow className="">Манай баг</Eyebrow>
        <BigTitle>
          <div> Нэг баг. </div>
          <em />
          <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Нэг зорилго.</em>
        </BigTitle>
        <div
          className="grid-5 flex justify-center"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
            alignItems: 'center',
          }}
        >
          {TEAM.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <img
                src={m.img}
                alt={m.name}
                style={{
                  width: 330,
                  height: 480,
                  borderRadius: '15%',
                  marginBottom: 16,
                  marginLeft: 20,
                }}
              />
              <h3
                style={{
                  fontFamily: 'var(--display)',
                  fontWeight: 500,
                  fontSize: 30,
                  marginBottom: 6,
                  marginLeft: 40,
                  letterSpacing: '-0.01em',
                }}
              >
                {m.name}
              </h3>
              <p
                style={{
                  fontSize: 17,
                  color: 'var(--accent)',
                  fontWeight: 600,
                  marginBottom: 8,
                  letterSpacing: '0.02em',
                  marginLeft: 40,
                }}
              >
                {m.role}
              </p>
              <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.55, marginLeft: 40 }}>
                {m.focus}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
