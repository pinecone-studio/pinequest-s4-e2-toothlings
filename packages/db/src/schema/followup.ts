import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

const uuid = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID())
const ts = (name: string) => integer(name, { mode: 'timestamp_ms' })
const bool = (name: string) => integer(name, { mode: 'boolean' })

/**
 * One OPEN follow-up arc per child per season.
 * Fixes the silent-stale-status bug: a second-season red screening always opens a
 * fresh, visible episode. The uniqueness is PARTIAL (closedAt IS NULL) so the
 * lifecycle can close an old episode and open a new one within the SAME season —
 * a full UNIQUE(childKey, triggerSeasonId) blocked that second insert.
 * Closed episodes are immutable — corrections require a new screening event.
 */
export const followUpEpisodes = sqliteTable('FollowUpEpisode', {
  id: uuid(),
  childKey: text('childKey').notNull(),
  schoolId: text('schoolId').notNull(),
  triggerSeasonId: text('triggerSeasonId').notNull(),
  triggerScreeningId: text('triggerScreeningId').notNull(),
  triggerLevel: text('triggerLevel').notNull(),  // 'yellow' | 'red'
  triggerScore: real('triggerScore').notNull().default(0),
  status: text('status').notNull().default('flagged'),
  assignedToId: text('assignedToId'),
  appointmentAt: ts('appointmentAt'),
  notifiedAt: ts('notifiedAt'),
  notificationChannel: text('notificationChannel'),
  notes: text('notes'),
  closedAt: ts('closedAt'),            // NULL = open episode
  closedReason: text('closedReason'),  // EpisodeCloseReason
  escalationFlag: bool('escalationFlag').notNull().default(false),
  previousEpisodeId: text('previousEpisodeId'),
  updatedAt: ts('updatedAt').notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
  updatedById: text('updatedById').notNull(),
  version: integer('version').notNull().default(0),
}, (t) => [
  uniqueIndex('FollowUpEpisode_child_season_open_key').on(t.childKey, t.triggerSeasonId).where(sql`${t.closedAt} is null`),
  index('FollowUpEpisode_school_status_idx').on(t.schoolId, t.status),
  index('FollowUpEpisode_childKey_idx').on(t.childKey),
  index('FollowUpEpisode_open_idx').on(t.schoolId, t.closedAt),
])

/** Append-only audit log of every status transition on a FollowUpEpisode. */
export const followUpEvents = sqliteTable('FollowUpEvent', {
  id: uuid(),
  episodeId: text('episodeId').notNull(),
  childKey: text('childKey').notNull(),
  seasonId: text('seasonId').notNull(),
  fromStatus: text('fromStatus'),      // null on episode creation
  toStatus: text('toStatus').notNull(),
  actorId: text('actorId').notNull(),
  actorRole: text('actorRole').notNull(),
  channel: text('channel'),
  note: text('note'),
  occurredAt: ts('occurredAt').notNull().$defaultFn(() => new Date()),
}, (t) => [
  index('FollowUpEvent_episodeId_idx').on(t.episodeId),
  index('FollowUpEvent_childKey_idx').on(t.childKey),
])
