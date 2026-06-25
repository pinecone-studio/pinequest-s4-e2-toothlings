import type { UserScopeGrant, ScopeKind } from '@pinequest/types'

type ScopeTarget = {
  childKey?: string
  classId?: string
  schoolId?: string
  districtCode?: string
}

// Hierarchy: district > school > class > child
const RANK: Record<ScopeKind, number> = {
  district: 4,
  school: 3,
  class: 2,
  child: 1,
}

/**
 * Returns true if the grant covers the target.
 * A broader scope covers all narrower targets within it:
 *   school grant covers any classId/childKey in that school.
 * The caller must pass school/district membership if needed —
 * this function does no DB lookups (pure, testable).
 */
export const scopeCovers = (grant: UserScopeGrant, target: ScopeTarget): boolean => {
  const rank = RANK[grant.scopeKind as ScopeKind] ?? 0

  if (grant.scopeKind === 'district') {
    return target.districtCode === grant.scopeId || rank >= RANK.school
  }
  if (grant.scopeKind === 'school') {
    return (
      target.schoolId === grant.scopeId ||
      (target.classId !== undefined) || // school covers any class within it (caller verifies membership)
      (target.childKey !== undefined)
    )
  }
  if (grant.scopeKind === 'class') {
    return target.classId === grant.scopeId || target.childKey !== undefined
  }
  if (grant.scopeKind === 'child') {
    return target.childKey === grant.scopeId
  }
  return false
}

/** Returns true if ANY of the user's grants covers the target. */
export const hasScope = (grants: UserScopeGrant[], target: ScopeTarget): boolean =>
  grants.some(g => scopeCovers(g, target))
