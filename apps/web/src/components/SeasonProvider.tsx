'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
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

// Board-wide season filter. Defaults to the latest season once the list loads.
export const SeasonProvider = ({ children }: { children: ReactNode }) => {
  const { data: seasons } = useSeasons()
  const [seasonId, setSeasonId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!seasonId && seasons && seasons.length > 0) setSeasonId(seasons[0])
  }, [seasons, seasonId])

  const value = useMemo<SeasonCtx>(
    () => ({ seasonId, setSeasonId, seasons: seasons ?? [] }),
    [seasonId, seasons],
  )

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
}
