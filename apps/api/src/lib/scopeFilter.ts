import type { JwtPayload } from '../types.js'

export const schoolScope = (payload: JwtPayload): string | undefined =>
  payload.role === 'admin' ? undefined : (payload.schoolId ?? undefined)
