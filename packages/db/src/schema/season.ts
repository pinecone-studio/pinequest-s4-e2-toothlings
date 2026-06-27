import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

const ts = (name: string) => integer(name, { mode: 'timestamp_ms' })

// Authoritative season registry per school. Replaces SELECT DISTINCT seasonId queries.
// Seasons are per-school because different schools screen on different dates.
export const seasons = sqliteTable('Season', {
  id: text('id').notNull(),            // e.g. "2026-fall"
  schoolId: text('schoolId').notNull(),
  label: text('label'),                // optional Mongolian label override
  openedAt: ts('openedAt').notNull(),
  closedAt: ts('closedAt'),            // NULL = currently open season
  closedById: text('closedById'),
}, (t) => [
  uniqueIndex('Season_school_id_uniq').on(t.schoolId, t.id),
  index('Season_schoolId_idx').on(t.schoolId),
])
