/** Deterministic, anonymous child identity. Contains no PII. */
export type ChildKey = string

/** Inputs to derive a ChildKey (see @pinequest/core `childKey`). */
export interface ChildKeyInput {
  schoolId: string
  className: string
  rosterSlot: number
  birthYear: number
}

/**
 * Roster entry — the ONLY place PII (names, guardian phone) lives.
 * Screenings reference `childKey`; PII never travels in a screening payload.
 */
export interface Child {
  id: string
  classId: string
  childKey: ChildKey
  firstName: string
  lastName: string
  birthYear: number
  rosterSlot: number
  gender?: 'M' | 'F'
  guardianPhone?: string
  /** Guardian email for the parent screening summary (PII — roster only). */
  guardianEmail?: string
  consentObtained: boolean
  consentAt?: string
  isActive: boolean
  createdAt: string
}

/** One row of a bulk roster import (carries PII; stays admin-side). */
export interface RosterImportRow {
  rosterSlot: number
  firstName: string
  lastName: string
  birthYear: number
  gender?: 'M' | 'F'
  guardianPhone?: string
}

/** Surfaced to the admin during bulk import before committing. */
export interface DuplicateWarning {
  rosterSlot: number
  childKey: ChildKey
  reason: 'duplicate_slot' | 'duplicate_child_key'
}
