/**
 * Roles. One record, role-scoped views (see @pinequest/core role guards):
 * - screener:  NON-DENTAL capturer (teacher, school/kindergarten doctor) — capture + simple result + sync
 * - dentist:   the dental professional — full per-tooth chart; confirm/override triage (audited)
 * - follow_up: soum worklist; update follow-up status (audited)
 * - admin:     rosters, content versions, users, metrics
 */
export type UserRole = 'screener' | 'dentist' | 'follow_up' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  /** Scopes a non-admin user to one school/soum; undefined for admins. */
  schoolId?: string
  isActive: boolean
  createdAt: string
}
