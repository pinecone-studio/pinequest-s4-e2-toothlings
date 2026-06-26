'use client'

import { useEffect, useState } from 'react'
import { GlobalStyles } from './Landing.styles'
import { Navbar } from './Navbar'
import { ProgressRail } from './ProgressRail'
import { Hero } from './Hero'
import { Team } from './Team'
import { Problem } from './Problem'
import { Solution } from './Solution'
import { Features } from './Features'
import { Footer } from './Footer'
import { Lottie1 } from '../lotties/Lottie1'

export const Landing = () => {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const ids = ['hero', 'team', 'problem', 'solution', 'features', 'cta']
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const i = ids.indexOf(entry.target.id)
            if (i >= 0) setActive(i)
          }
        })
      },
      { threshold: 0.5 },
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })

    return () => obs.disconnect()
  }, [])

  return (
    <div
      className="Tooth Fairy deck"
      style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}
    >
      <GlobalStyles />
      <div className="paper-grain" />
      <Navbar active={active} />
      <ProgressRail active={active} />
      <Hero />
      <Team />
      <Problem />
      <Solution />
      <Features />
      <Footer />
    </div>
  )
}
