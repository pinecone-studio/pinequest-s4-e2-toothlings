'use client'
import { useState } from 'react'
import { useMotionValueEvent } from 'framer-motion'
import { useIntroProgress } from './useIntroProgress'
import { Lip } from './Lip'
import { LogoReveal } from './LogoReveal'
import { NextScreenIntro } from './NextScreenIntro'
import { INTRO, PIN_VH } from './introBrand'

const FIELD = `radial-gradient(120% 90% at 50% 42%, ${INTRO.base3} 0%, ${INTRO.base1} 46%, ${INTRO.base0} 100%)`

// The signature opening. The screen IS a closed mouth; one scroll gesture parts
// the lips, reveals the logo, settles it, then hands off into the landing.
// id="hero" keeps PageNav's section tracking working. Pinned for ~PIN_VH of
// scroll via a tall section + sticky inner layer.
export const MouthOpenIntro = () => {
  const { ref, progress, reduced } = useIntroProgress()
  const [active, setActive] = useState(false)
  const [handoff, setHandoff] = useState(false)

  useMotionValueEvent(progress, 'change', (p) => {
    setActive(p > 0.001 && p < 0.999) // will-change only while actively animating
    setHandoff(p > 0.76)
  })

  // Reduced motion: no pin, no lips — render the revealed state immediately,
  // fully usable, CTAs reachable.
  if (reduced) {
    return (
      <section id="hero" className="relative grid min-h-dvh place-items-center overflow-hidden" style={{ background: FIELD }}>
        <div className="relative h-[42vh] w-full">
          <LogoReveal progress={progress} reduced willChange="auto" />
        </div>
        <NextScreenIntro progress={progress} isStatic />
      </section>
    )
  }

  const willChange = active ? 'transform' : 'auto'

  return (
    <section id="hero" ref={ref} className="relative" style={{ height: `${100 + PIN_VH}vh`, background: INTRO.next }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: INTRO.next }}>
        {/* deep field — also the next-screen surface, so the hand-off is seamless */}
        <div className="absolute inset-0 z-0" style={{ background: FIELD }} />

        {/* logo revealed through the parting gap (behind the lips) */}
        <div className="absolute inset-0 z-10">
          <LogoReveal progress={progress} reduced={false} willChange={willChange} />
        </div>

        {/* the two lips — part symmetrically off the one progress value */}
        <div className="absolute inset-0 z-20">
          <Lip variant="lower" progress={progress} willChange={willChange} />
          <Lip variant="upper" progress={progress} willChange={willChange} />
        </div>

        {/* next-screen first content; fully inert (no tab/pointer/a11y) until the hand-off */}
        <div inert={!handoff}>
          <NextScreenIntro progress={progress} isStatic={false} />
        </div>
      </div>
    </section>
  )
}
