import { desc } from 'drizzle-orm'
import { auditLogs, type DB } from '@pinequest/db/d1'

const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')

const chainHash = async (
  prevHash: string | null,
  userId: string,
  entityType: string,
  entityId: string,
  action: string,
  newValueJson: string | null,
): Promise<string> => {
  const input = [prevHash ?? '', userId, entityType, entityId, action, newValueJson ?? ''].join('|')
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return toHex(buf)
}

export const writeAudit = async (
  db: DB,
  userId: string,
  entityType: string,
  entityId: string,
  action: string,
  oldValue: unknown,
  newValue: unknown,
): Promise<void> => {
  const newValueJson = newValue ? JSON.stringify(newValue) : null
  const [latest] = await db.select({ hash: auditLogs.hash }).from(auditLogs)
    .orderBy(desc(auditLogs.createdAt)).limit(1)
  const hash = await chainHash(latest?.hash ?? null, userId, entityType, entityId, action, newValueJson)
  await db.insert(auditLogs).values({
    userId,
    entityType,
    entityId,
    action,
    oldValue: oldValue ? JSON.stringify(oldValue) : null,
    newValue: newValueJson,
    hash,
  })
}
