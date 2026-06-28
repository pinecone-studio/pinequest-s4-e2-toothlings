import type { ILocalStore, OutboxEntry } from '../types.js'

const MAX_ATTEMPTS = 5
const TRIAGE_RANK: Record<string, number> = { red: 0, yellow: 1, green: 2 }
const backoffSeconds = (attempts: number): number => Math.min(30 * Math.pow(2, attempts), 3600)

/**
 * Volatile in-memory store.
 * Use in unit tests and as the reference implementation for real adapters.
 */
export class MemoryStore implements ILocalStore {
  private readonly entries = new Map<string, OutboxEntry>()

  async enqueue(entry: OutboxEntry): Promise<void> {
    this.entries.set(entry.id, { ...entry })
  }

  async getPending(): Promise<OutboxEntry[]> {
    const now = new Date().toISOString()
    return Array.from(this.entries.values())
      .filter((e) => !e.sentAt && e.attempts < MAX_ATTEMPTS && (!e.nextRetryAt || e.nextRetryAt <= now))
      .sort((a, b) => {
        const ta = TRIAGE_RANK[a.triageLevel ?? 'green'] ?? 2
        const tb = TRIAGE_RANK[b.triageLevel ?? 'green'] ?? 2
        return ta !== tb ? ta - tb : a.createdAt.localeCompare(b.createdAt)
      })
  }

  async getStuck(): Promise<OutboxEntry[]> {
    return Array.from(this.entries.values()).filter((e) => !e.sentAt && e.attempts >= MAX_ATTEMPTS)
  }

  async resetAttempts(id: string): Promise<void> {
    const e = this.entries.get(id)
    if (e) this.entries.set(id, { ...e, attempts: 0, lastError: undefined, nextRetryAt: undefined })
  }

  async markSent(id: string): Promise<void> {
    const e = this.entries.get(id)
    if (e) this.entries.set(id, { ...e, sentAt: new Date().toISOString() })
  }

  async markFailed(id: string, error: string): Promise<void> {
    const e = this.entries.get(id)
    if (!e) return
    const newAttempts = e.attempts + 1
    const nextRetryAt = new Date(Date.now() + backoffSeconds(newAttempts) * 1000).toISOString()
    this.entries.set(id, { ...e, attempts: newAttempts, lastError: error, nextRetryAt })
  }

  async clear(): Promise<void> {
    this.entries.clear()
  }

  /** Test helper — returns all entries including sent ones. */
  all(): OutboxEntry[] {
    return Array.from(this.entries.values())
  }
}
