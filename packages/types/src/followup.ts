import type { EpisodeCloseReason, FollowUpStatus } from './common.js'
import type { ChildKey } from './child.js'
import type { SeasonId, TriageLevel } from './common.js'

/**
 * The ONLY mutable record. Belongs to a child across screenings.
 * Syncs two-way; last-write-wins by `updatedAt` + actor, guarded by `version`.
 * @deprecated Superseded by FollowUpEpisode. Kept for rollback compatibility.
 */
export interface FollowUp {
  id: string
  childKey: ChildKey
  schoolId: string
  status: FollowUpStatus
  assignedToId?: string
  appointmentAt?: string
  notifiedAt?: string
  notificationChannel?: 'sms' | 'call' | 'in_person'
  notes?: string
  updatedAt: string
  updatedById: string
  /** Optimistic-lock counter; the server rejects a stale update. */
  version: number
}

/** Mutation payload; `version` is the value the client last observed. */
export type FollowUpUpdate = Pick<FollowUp, 'status' | 'version'> &
  Partial<
    Pick<
      FollowUp,
      'assignedToId' | 'appointmentAt' | 'notifiedAt' | 'notificationChannel' | 'notes'
    >
  >

/**
 * One follow-up arc per child per season.
 * Keyed UNIQUE(childKey, triggerSeasonId) — fixes the silent-stale-status bug
 * where `onConflictDoNothing` would swallow a second-season red child.
 * Closed episodes are immutable; corrections require a new screening event.
 */
export interface FollowUpEpisode {
  id: string
  childKey: ChildKey
  schoolId: string
  triggerSeasonId: SeasonId
  triggerScreeningId: string
  /** The triage level that opened this episode: always 'yellow' | 'red'. */
  triggerLevel: TriageLevel
  triggerScore: number
  status: FollowUpStatus
  assignedToId?: string
  appointmentAt?: string
  notifiedAt?: string
  notificationChannel?: 'sms' | 'call' | 'in_person'
  notes?: string
  /** Set when episode reaches a terminal state. Null = open. */
  closedAt?: string
  closedReason?: EpisodeCloseReason
  /** True when prior episode closed as treatment_refused AND triageScore increased. */
  escalationFlag: boolean
  /** Links to the episode this one superseded or branched from. */
  previousEpisodeId?: string
  updatedAt: string
  updatedById: string
  version: number
}

/** Immutable audit record emitted on every status transition. */
export interface FollowUpEventRecord {
  id: string
  episodeId: string
  childKey: ChildKey
  seasonId: SeasonId
  fromStatus: FollowUpStatus | null
  toStatus: FollowUpStatus
  actorId: string
  actorRole: string
  channel?: string
  note?: string
  occurredAt: string
}

/** Mutation payload for an open episode; `version` is the last observed value. */
export type EpisodeUpdate = Pick<FollowUpEpisode, 'status' | 'version'> &
  Partial<Pick<FollowUpEpisode, 'assignedToId' | 'appointmentAt' | 'notifiedAt' | 'notificationChannel' | 'notes'>>
