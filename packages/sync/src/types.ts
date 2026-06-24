import type { ScreeningCreate } from '@pinequest/types'

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
  markSent(id: string): Promise<void>
  markFailed(id: string, error: string): Promise<void>
  clear(): Promise<void>
}
