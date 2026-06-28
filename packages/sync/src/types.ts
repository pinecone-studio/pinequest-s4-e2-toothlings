import type { ScreeningCreate } from '@pinequest/types'

/** No-PII prior-season result per child, cached from /api/teacher/classes/:id/history-cache. */
export type HistoryCacheEntry = {
  childKey: string
  seasonId: string
  triageLevel: 'green' | 'yellow' | 'red'
  confirmedLevel: 'green' | 'yellow' | 'red' | null
  /** Date-only ISO string (YYYY-MM-DD) — reduces fingerprinting risk. */
  capturedAt: string
  longitudinalFlags: Array<{ fdi: number; flag: string }>
  cachedAt: string
}

/** Storage contract for the prior-season history cache. Adapter: expo-sqlite on mobile. */
export interface IHistoryCache {
  /** Upsert a batch (INSERT OR REPLACE by childKey). */
  putEntries(entries: HistoryCacheEntry[]): Promise<void>
  /** Return the cached entry for a child, or null if not yet loaded. */
  getByChildKey(childKey: string): Promise<HistoryCacheEntry | null>
  /** Evict specific children (use before a full class refresh). */
  clearForKeys(childKeys: string[]): Promise<void>
  clear(): Promise<void>
}

/** A pending sync event waiting to be flushed to the API. */
export type OutboxEntry = {
  id: string
  type: 'screening_create'
  /** JSON-serialised ScreeningCreate — kept as string so storage adapters stay generic. */
  payload: string
  createdAt: string
  attempts: number
  lastError?: string
  sentAt?: string
  /** ISO timestamp before which this entry should not be retried (exponential backoff). */
  nextRetryAt?: string
  /** Triage level extracted at enqueue time; used to sort urgent screenings first. */
  triageLevel?: 'green' | 'yellow' | 'red'
}

/** Parsed form of an OutboxEntry used internally by Outbox. */
export type ParsedEntry = Omit<OutboxEntry, 'payload'> & { data: ScreeningCreate }

/**
 * Storage contract that adapters must implement.
 * Implementations: expo-sqlite (mobile), Dexie/IndexedDB (web), MemoryStore (tests).
 */
export interface ILocalStore {
  enqueue(entry: OutboxEntry): Promise<void>
  getPending(): Promise<OutboxEntry[]>
  /** Entries that have exceeded max retry attempts and will no longer auto-sync. */
  getStuck(): Promise<OutboxEntry[]>
  /** Reset attempts on stuck entries so they will be retried on next sync. */
  resetAttempts(id: string): Promise<void>
  markSent(id: string): Promise<void>
  markFailed(id: string, error: string): Promise<void>
  clear(): Promise<void>
}
