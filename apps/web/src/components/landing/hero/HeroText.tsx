'use client'
import Link from 'next/link'
import { type MotionValue } from 'framer-motion'
import { AT, HERO_IMGS } from './heroData'
import { Zoom } from './Zoom'

export const HeroText = ({ p }: { p: MotionValue<number> }) => (
  <div className="flex h-full w-full items-center px-[3vw]">
    <div className="w-full">
      <h1
        style={{ fontSize: 'clamp(1.8rem, 5vw, 7.5rem)', lineHeight: 0.92, letterSpacing: '-0.03em' }}
        className="w-full select-none font-black uppercase"
      >
        <span className="block">
          <span style={{ color: 'var(--olive)' }}>Шүдний скрининг —</span>
          <span className="text-white"> хаанаас ч</span>
        </span>
        <span className="block text-white">
          <Zoom p={p} at={AT[0]} src={HERO_IMGS[0].src} round />{' '}
          гар утасаар{' '}
          <Zoom p={p} at={AT[1]} src={HERO_IMGS[1].src} round />
        </span>
        <span className="block text-white">
          <Zoom p={p} at={AT[2]} src={HERO_IMGS[2].src} />{' '}
          хийж{' '}
          <Zoom p={p} at={AT[3]} src={HERO_IMGS[3].src} round />{' '}
          болно
        </span>
      </h1>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href="/?auth=register"
          className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-black uppercase tracking-widest transition-opacity hover:opacity-90 active:scale-95"
          style={{ background: 'var(--olive)', color: '#0d1e35' }}
        >
          Эхлэх
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Link
          href="/?auth=login"
          className="inline-flex items-center rounded-full border border-white/25 px-8 py-4 text-[15px] font-bold uppercase tracking-widest text-white/80 transition-colors hover:border-white/60 hover:text-white"
        >
          Нэвтрэх
        </Link>
      </div>
    </div>
  </div>
)
