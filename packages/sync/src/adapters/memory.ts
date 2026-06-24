import type { ILocalStore, OutboxEntry } from '../types.js'

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
    return Array.from(this.entries.values()).filter((e) => !e.sentAt)
  }

  async markSent(id: string): Promise<void> {
    const e = this.entries.get(id)
    if (e) this.entries.set(id, { ...e, sentAt: new Date().toISOString() })
  }

  async markFailed(id: string, error: string): Promise<void> {
    const e = this.entries.get(id)
    if (e) this.entries.set(id, { ...e, attempts: e.attempts + 1, lastError: error })
  }

  async clear(): Promise<void> {
    this.entries.clear()
  }

  /** Test helper — returns all entries including sent ones. */
  all(): OutboxEntry[] {
    return Array.from(this.entries.values())
  }
}
