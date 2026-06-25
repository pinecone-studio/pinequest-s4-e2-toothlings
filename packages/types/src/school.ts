import type { SeasonId } from './common.js'

/** A school or soum location node that holds rosters. */
export interface School {
  id: string
  name: string
  /** Soum/aimag location code. */
  soumCode?: string
  district?: string
  createdAt: string
}

/** A class roster for one school + class + season. */
export interface SchoolClass {
  id: string
  schoolId: string
  /** Class label, e.g. "3A". */
  name: string
  seasonId: SeasonId
  gradeLevel?: number
  /** Carry-forward pointer to the prior season's class this was promoted from. */
  sourceClassId?: string
  /** Screener-set date/time for the next-season screening visit (ISO). */
  scheduledAt?: string | null
  /** Optional phone for the visit reminder. */
  reminderPhone?: string | null
  isActive: boolean
  createdAt: string
}

/** Class list row enriched with roster + coverage counts for the board. */
export interface SchoolClassRow extends SchoolClass {
  /** Active roster size (children enrolled). */
  enrolled: number
  /** Distinct children with at least one screening this season. */
  screened: number
}

/** Promote a class into a new season (carry the roster forward). */
export interface CarryForwardInput {
  sourceClassId: string
  newSeasonId: SeasonId
  /** Defaults to the source class name. */
  newName?: string
  /** Optional scheduled date/time for the new season's visit (ISO). */
  scheduledAt?: string | null
  /** Optional reminder phone. */
  reminderPhone?: string | null
}
