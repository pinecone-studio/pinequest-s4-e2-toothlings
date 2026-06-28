import * as SQLite from 'expo-sqlite'
import type { ILocalStore, OutboxEntry } from '@pinequest/sync'

const DB_NAME = 'screener_outbox.db'

const ensureTable = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      lastError TEXT,
      sentAt TEXT
    );
  `)
  // Migrate: add columns if they don't exist yet (SQLite ignores errors on duplicate columns)
  for (const col of [
    'ALTER TABLE outbox ADD COLUMN nextRetryAt TEXT',
    'ALTER TABLE outbox ADD COLUMN triageLevel TEXT',
  ]) {
    try { await db.execAsync(col) } catch { /* column already exists */ }
  }
}

const TRIAGE_ORDER = `CASE triageLevel WHEN 'red' THEN 0 WHEN 'yellow' THEN 1 ELSE 2 END ASC`

let _db: SQLite.SQLiteDatabase | null = null

const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME)
    await ensureTable(_db)
  }
  return _db
}

/**
 * SQLite-backed outbox store for offline-first screening capture.
 * Survives app restarts; syncs when the device comes back online.
 */
export class SQLiteStore implements ILocalStore {
  async enqueue(entry: OutboxEntry): Promise<void> {
    const db = await getDb()
    await db.runAsync(
      `INSERT OR IGNORE INTO outbox (id, type, payload, createdAt, attempts, triageLevel)
       VALUES (?, ?, ?, ?, 0, ?)`,
      entry.id,
      entry.type,
      entry.payload,
      entry.createdAt,
      entry.triageLevel ?? null,
    )
  }

  async getPending(): Promise<OutboxEntry[]> {
    const db = await getDb()
    const now = new Date().toISOString()
    return db.getAllAsync<OutboxEntry>(
      `SELECT * FROM outbox
       WHERE sentAt IS NULL AND attempts < 5
         AND (nextRetryAt IS NULL OR nextRetryAt <= ?)
       ORDER BY ${TRIAGE_ORDER}, createdAt ASC`,
      now,
    )
  }

  async getStuck(): Promise<OutboxEntry[]> {
    const db = await getDb()
    return db.getAllAsync<OutboxEntry>(
      `SELECT * FROM outbox WHERE sentAt IS NULL AND attempts >= 5 ORDER BY createdAt ASC`,
    )
  }

  async resetAttempts(id: string): Promise<void> {
    const db = await getDb()
    await db.runAsync(
      `UPDATE outbox SET attempts = 0, lastError = NULL, nextRetryAt = NULL WHERE id = ?`,
      id,
    )
  }

  async markSent(id: string): Promise<void> {
    const db = await getDb()
    await db.runAsync(`UPDATE outbox SET sentAt = ? WHERE id = ?`, new Date().toISOString(), id)
  }

  async markFailed(id: string, error: string): Promise<void> {
    const db = await getDb()
    // Exponential backoff: 30s, 60s, 120s, 240s, 480s (capped at 1 hour)
    await db.runAsync(
      `UPDATE outbox
       SET attempts = attempts + 1,
           lastError = ?,
           nextRetryAt = datetime('now', '+' || MIN(30 * (1 << MIN(attempts, 6)), 3600) || ' seconds')
       WHERE id = ?`,
      error,
      id,
    )
  }

  async clear(): Promise<void> {
    const db = await getDb()
    await db.runAsync(`DELETE FROM outbox`)
  }
}
