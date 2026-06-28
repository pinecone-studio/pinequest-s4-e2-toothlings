import { useState, useCallback, useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { Outbox } from '@pinequest/sync'
import { SQLiteStore } from './sqliteStore'
import { getToken } from './auth'

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000'

const store = new SQLiteStore()
export const outbox = new Outbox(store)

export type SyncState = {
  syncing: boolean
  lastResult: string | null
  pendingCount: number
  deadCount: number
}

const refreshCounts = async (): Promise<{ pendingCount: number; deadCount: number }> => {
  const [pendingCount, stuck] = await Promise.all([
    outbox.getPendingCount(),
    outbox.getStuck(),
  ])
  return { pendingCount, deadCount: stuck.length }
}

export const useOutboxSync = () => {
  const [state, setState] = useState<SyncState>({ syncing: false, lastResult: null, pendingCount: 0, deadCount: 0 })

  const sync = useCallback(async () => {
    const token = await getToken()
    const counts = await refreshCounts()
    if (!token) { setState(s => ({ ...s, ...counts })); return }
    setState(s => ({ ...s, syncing: true, lastResult: null, ...counts }))
    try {
      const stats = await outbox.sync(BASE, token)
      const after = await refreshCounts()
      if (stats.sent > 0 || stats.failed > 0) {
        setState({ syncing: false, lastResult: `↑ ${stats.sent} илгээсэн, ${stats.failed} алдаа`, ...after })
      } else {
        setState({ syncing: false, lastResult: null, ...after })
      }
    } catch {
      const after = await refreshCounts()
      setState({ syncing: false, lastResult: 'Синк амжилтгүй', ...after })
    }
  }, [])

  // Re-sync when app returns to foreground after being backgrounded
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && next === 'active') {
        void sync()
      }
      appStateRef.current = next
    })
    return () => sub.remove()
  }, [sync])

  const retryStuck = useCallback(async (id: string) => {
    await outbox.resetStuck(id)
    await sync()
  }, [sync])

  return { ...state, sync, retryStuck }
}
