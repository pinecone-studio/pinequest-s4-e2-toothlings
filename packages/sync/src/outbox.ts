import type { ScreeningCreate } from '@pinequest/types'
import type { ILocalStore, OutboxEntry, ParsedEntry } from './types.js'

const MAX_ATTEMPTS = 5

export type SyncStats = { sent: number; failed: number; skipped: number }

export class Outbox {
  constructor(private readonly store: ILocalStore) {}

  /** Enqueue a new screening event for later sync. Idempotent on entry.id. */
  async add(screening: ScreeningCreate): Promise<void> {
    const entry: OutboxEntry = {
      id: screening.id,
      type: 'screening_create',
      payload: JSON.stringify(screening),
      createdAt: new Date().toISOString(),
      attempts: 0,
      triageLevel: screening.triage.level,
    }
    await this.store.enqueue(entry)
  }

  /** Parse pending entries (skip ones that exceeded max attempts). */
  async getPending(): Promise<ParsedEntry[]> {
    const raw = await this.store.getPending()
    return raw
      .filter((e) => e.attempts < MAX_ATTEMPTS)
      .map((e) => ({ ...e, data: JSON.parse(e.payload) as ScreeningCreate }))
  }

  /**
   * Flush all pending entries to the API.
   * Each entry is sent with exponential-back-off attempt tracking.
   * Returns a stats summary.
   */
  async sync(apiBaseUrl: string, token: string): Promise<SyncStats> {
    const pending = await this.store.getPending()
    let sent = 0
    let failed = 0
    let skipped = 0

    for (const entry of pending) {
      if (entry.attempts >= MAX_ATTEMPTS) {
        skipped++
        continue
      }
      try {
        const res = await fetch(`${apiBaseUrl}/api/screenings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: entry.payload,
        })
        if (res.ok) {
          await this.store.markSent(entry.id)
          sent++
        } else {
          const json = (await res.json().catch(() => ({}))) as { message?: string }
          await this.store.markFailed(entry.id, json.message ?? `http_${res.status}`)
          failed++
        }
      } catch (err) {
        await this.store.markFailed(
          entry.id,
          err instanceof Error ? err.message : 'network_error',
        )
        failed++
      }
    }

    return { sent, failed, skipped }
  }

  /** Count of entries waiting to sync (not yet sent, under max attempts). */
  async getPendingCount(): Promise<number> {
    const raw = await this.store.getPending()
    return raw.filter((e) => e.attempts < MAX_ATTEMPTS).length
  }

  /** Entries that have permanently failed and will not auto-retry. */
  async getStuck(): Promise<OutboxEntry[]> {
    return this.store.getStuck()
  }

  /** Force-retry a stuck entry by resetting its attempt counter. */
  async resetStuck(id: string): Promise<void> {
    await this.store.resetAttempts(id)
  }

  async clear(): Promise<void> {
    await this.store.clear()
  }
}
