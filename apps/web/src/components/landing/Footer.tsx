'use client'
import Image from 'next/image'

export const Footer = () => (
  <footer className="relative z-10 flex flex-col items-center justify-center gap-3 bg-black py-8"
    style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
    <div className="flex items-center gap-3">
      <Image src="/logoGreen.png" alt="ToothLings" width={44} height={44} className="select-none object-contain" />
      <span className="select-none font-black" style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '-0.03em' }}>
        <span style={{ color: '#fff' }}>Tooth</span><span style={{ color: 'var(--olive)' }}>Lings</span>
      </span>
    </div>
    <p className="text-center text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
      Скрининг-триаж хэрэгсэл · Шүдний эмчийн онош биш
    </p>
    <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>
      © 2026 ToothLings · MADE IN MONGOLIA
    </p>
  </footer>
)
