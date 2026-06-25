import { prisma } from '@pinequest/db'
import type { JwtPayload } from '../types.js'

// Legacy single-school scope (still used by school-level routes e.g. followups).
export const schoolScope = (payload: JwtPayload): string | undefined =>
  payload.role === 'admin' ? undefined : (payload.schoolId ?? undefined)

// Resolved visibility for the current user, derived from UserScope rows + JWT.
// admin → everything; school doctor → their school(s); class teacher → their
// class(es). Loaded at request time (not from the token) so grants take effect
// immediately and the token stays small.
export type ScreeningScope = { all: boolean; classIds: string[]; schoolIds: string[] }

export const resolveScope = async (payload: JwtPayload): Promise<ScreeningScope> => {
  if (payload.role === 'admin') return { all: true, classIds: [], schoolIds: [] }
  const scopes = await prisma.userScope.findMany({
    where: { userId: payload.sub },
    select: { scopeKind: true, scopeId: true },
  })
  const classIds = scopes.filter((s) => s.scopeKind === 'class').map((s) => s.scopeId)
  const schoolIds = scopes.filter((s) => s.scopeKind === 'school').map((s) => s.scopeId)
  if (payload.schoolId && !schoolIds.includes(payload.schoolId)) schoolIds.push(payload.schoolId)
  return { all: false, classIds, schoolIds }
}

// OR-clause over classId/schoolId for any model that has both columns
// (Screening, Child). `undefined` = admin/no filter; a deny-all clause when the
// user has no grants at all (sees nothing, never everything).
export const scopeOr = (s: ScreeningScope) => {
  if (s.all) return undefined
  const or: Array<{ classId: { in: string[] } } | { schoolId: { in: string[] } } | { id: string }> = []
  if (s.classIds.length) or.push({ classId: { in: s.classIds } })
  if (s.schoolIds.length) or.push({ schoolId: { in: s.schoolIds } })
  if (or.length === 0) or.push({ id: '__no_scope__' })
  return or
}
