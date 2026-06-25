import type { UserRole } from '@pinequest/types'

export type JwtPayload = {
  sub: string
  role: UserRole
  schoolId?: string
}

export type AppEnv = {
  Variables: {
    jwtPayload: JwtPayload
  }
}
