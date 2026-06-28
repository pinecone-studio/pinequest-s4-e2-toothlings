'use client'
import Image from 'next/image'
import { type MotionValue } from 'framer-motion'
import { TEAM } from './heroData'

export const HeroTeamPanel = ({ p: _ }: { p: MotionValue<number> }) => (
  <div className="absolute inset-0 overflow-hidden bg-[#0a0a0a]">
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <p
        className="select-none text-center font-black uppercase leading-none"
        style={{ fontSize: 'clamp(6rem, 18vw, 28rem)', letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.04)' }}
      >
        TEAM<br />MEMBERS
      </p>
    </div>
    <div className="absolute inset-0 flex flex-col items-center justify-center px-[4vw]">
      <h2
        className="mb-[3vh] text-center font-black uppercase"
        style={{ fontSize: 'clamp(1.8rem, 5vw, 6.5rem)', lineHeight: 0.92, letterSpacing: '-0.02em', color: 'var(--olive)' }}
      >
        Багийн танилцуулга
      </h2>
      <div className="mb-[4vh] h-px w-full max-w-[72vw]" style={{ background: 'var(--olive)', opacity: 0.45 }} />
      <div className="grid w-full grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 md:flex md:items-center md:justify-center md:gap-[2vw]">
        {TEAM.map((member, i) => (
          <div key={i} className="flex flex-col items-center gap-2 text-center">
            <div
              className="relative overflow-hidden rounded-full ring-[3px]"
              style={{
                width: 'clamp(90px, 36vw, 260px)',
                height: 'clamp(90px, 36vw, 260px)',
                boxShadow: '0 0 0 3px var(--olive)',
              }}
            >
              <Image src={member.src} alt={member.name} fill className="object-cover object-top" sizes="(max-width:640px) 45vw, 25vw" />
            </div>
            <div>
              <p className="font-bold leading-tight text-white" style={{ fontSize: 'clamp(12px, 1.2vw, 18px)' }}>{member.name}</p>
              <p className="font-semibold leading-tight" style={{ fontSize: 'clamp(10px, 0.9vw, 14px)', color: 'var(--olive)' }}>{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)
