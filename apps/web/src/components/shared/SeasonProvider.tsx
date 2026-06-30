'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { parseSeason, seasonForDate, seasonOrdinal, seasonsForYear } from '@pinequest/core'
import { useSeasons } from '@/hooks/useSeasons'

type SeasonCtx = {
  seasonId: string | undefined
  setSeasonId: (s: string) => void
  seasons: string[]
}

const SeasonContext = createContext<SeasonCtx | null>(null)

export const useSeason = (): SeasonCtx => {
  const ctx = useContext(SeasonContext)
  if (!ctx) throw new Error('useSeason must be used within <SeasonProvider>')
  return ctx
}

// Seasons the picker offers: the current year's three screening terms ALWAYS
// appear (terms without screenings still get a tab + empty state), unioned with
// any other seasons that already hold data. Ordered newest-year-first, then the
// school-year progression fall → winter → spring within a year.
const buildSeasons = (current: string, withData: string[]): string[] => {
  const all = new Set([...seasonsForYear(Number(parseSeason(current).year)), ...withData])
  return [...all].sort((a, b) => {
    const byYear = Number(b.split('-')[0]) - Number(a.split('-')[0])
    return byYear !== 0 ? byYear : seasonOrdinal(a) - seasonOrdinal(b)
  })
}

// Board-wide season filter. Always lists the current year's three terms (empty
// ones still show, with empty states downstream) and defaults to the current season.
export const SeasonProvider = ({ children }: { children: ReactNode }) => {
  const { data: withData } = useSeasons()
  const [seasonId, setSeasonId] = useState<string | undefined>(undefined)
  const seasons = useMemo(() => buildSeasons(seasonForDate(new Date()), withData ?? []), [withData])

  useEffect(() => {
    if (!seasonId) setSeasonId(seasonForDate(new Date()))
  }, [seasonId])

  const value = useMemo<SeasonCtx>(
    () => ({ seasonId, setSeasonId, seasons }),
    [seasonId, seasons],
  )

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
}
