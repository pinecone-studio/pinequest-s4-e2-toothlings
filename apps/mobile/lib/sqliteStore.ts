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
}

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
      `INSERT OR IGNORE INTO outbox (id, type, payload, createdAt, attempts)
       VALUES (?, ?, ?, ?, 0)`,
      entry.id,
      entry.type,
      entry.payload,
      entry.createdAt,
    )
  }

  async getPending(): Promise<OutboxEntry[]> {
    const db = await getDb()
    return db.getAllAsync<OutboxEntry>(`SELECT * FROM outbox WHERE sentAt IS NULL ORDER BY createdAt ASC`)
  }

  async markSent(id: string): Promise<void> {
    const db = await getDb()
    await db.runAsync(`UPDATE outbox SET sentAt = ? WHERE id = ?`, new Date().toISOString(), id)
  }

  async markFailed(id: string, error: string): Promise<void> {
    const db = await getDb()
    await db.runAsync(
      `UPDATE outbox SET attempts = attempts + 1, lastError = ? WHERE id = ?`,
      error,
      id,
    )
  }

  async clear(): Promise<void> {
    const db = await getDb()
    await db.runAsync(`DELETE FROM outbox`)
  }
}
