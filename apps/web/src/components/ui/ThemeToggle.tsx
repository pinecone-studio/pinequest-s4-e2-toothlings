'use client'

import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'

// Floating light/dark toggle (bottom-right, as in the mockup). Mirrors the
// previous TopBar toggle logic exactly — no theme-init behavior changes.
const ThemeToggle = () => {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('screener.theme', next ? 'dark' : 'light')
    setDark(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Өдрийн горим' : 'Шөнийн горим'}
      className="btn fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[12px] font-semibold text-text-base shadow-(--shadow-float) transition-all duration-150 hover:border-primary"
    >
      {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
      {dark ? 'Өдөр' : 'Шөнө'}
    </button>
  )
}

export default ThemeToggle
