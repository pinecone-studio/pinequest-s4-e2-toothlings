import type { UserScopeGrant, ScopeKind } from '@pinequest/types'

type ScopeTarget = {
  childKey?: string
  classId?: string
  schoolId?: string
  districtCode?: string
}

/**
 * Returns true if the grant covers the target.
 *
 * A broader grant covers a narrower target through the target's OWN membership
 * fields: a school grant covers a child only when the caller has resolved that
 * child's `schoolId` into the target. This function does no DB lookups (pure,
 * testable), so the caller must populate the membership it wants checked.
 * Matching is strict per level — a bare `childKey` is NOT covered by a school or
 * class grant unless the matching `schoolId`/`classId` is also supplied.
 */
export const scopeCovers = (grant: UserScopeGrant, target: ScopeTarget): boolean => {
  switch (grant.scopeKind as ScopeKind) {
    case 'district':
      return target.districtCode === grant.scopeId
    case 'school':
      return target.schoolId === grant.scopeId
    case 'class':
      return target.classId === grant.scopeId
    case 'child':
      return target.childKey === grant.scopeId
    default:
      return false
  }
}

/** Returns true if ANY of the user's grants covers the target. */
export const hasScope = (grants: UserScopeGrant[], target: ScopeTarget): boolean =>
  grants.some(g => scopeCovers(g, target))
