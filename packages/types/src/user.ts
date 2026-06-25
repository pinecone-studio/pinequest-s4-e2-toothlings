/**
 * Roles describe CAPABILITY, not coverage.
 * Coverage (which school/class/child a user can see) is expressed via UserScopeGrant.
 * - screener:  NON-DENTAL capturer — teacher/school doctor/parent/soum worker
 * - dentist:   dental professional — full chart; confirm/override (audited)
 * - follow_up: soum worklist; update follow-up status (audited)
 * - admin:     rosters, content versions, users, metrics
 */
export type UserRole = 'screener' | 'dentist' | 'follow_up' | 'admin'

/** Scope hierarchy: district > school > class > child */
export type ScopeKind = 'child' | 'class' | 'school' | 'district'

export interface UserScopeGrant {
  scopeKind: ScopeKind
  scopeId: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  /** Primary school fast-path; still required for single-school users. */
  schoolId?: string
  /** Granular scope grants — populated for multi-scope or parent users. */
  scopes?: UserScopeGrant[]
  isActive: boolean
  createdAt: string
}
