import { useState, useCallback } from 'react'
import { Outbox } from '@pinequest/sync'
import { SQLiteStore } from './sqliteStore'
import { getToken } from './auth'

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000'

const store = new SQLiteStore()
export const outbox = new Outbox(store)

export type SyncState = { syncing: boolean; lastResult: string | null }

export const useOutboxSync = () => {
  const [state, setState] = useState<SyncState>({ syncing: false, lastResult: null })

  const sync = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    setState({ syncing: true, lastResult: null })
    try {
      const stats = await outbox.sync(BASE, token)
      if (stats.sent > 0 || stats.failed > 0) {
        setState({ syncing: false, lastResult: `↑ ${stats.sent} илгээсэн, ${stats.failed} алдаа` })
      } else {
        setState({ syncing: false, lastResult: null })
      }
    } catch {
      setState({ syncing: false, lastResult: 'Синк амжилтгүй' })
    }
  }, [])

  return { ...state, sync }
}
