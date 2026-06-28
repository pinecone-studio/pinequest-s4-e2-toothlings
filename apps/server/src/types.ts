import type { UserRole } from '@pinequest/types'
import type { D1Database } from '@cloudflare/workers-types'
import type { DB } from '@pinequest/db/d1'

export type JwtPayload = {
  sub: string
  role: UserRole
  schoolId?: string
}

export type AppEnv = {
  Bindings: {
    DB: D1Database
    JWT_SECRET?: string
    CORS_ORIGIN?: string
    INFERENCE_URL?: string
    MODEL_VERSION?: string
    SEED_ENABLED?: string
  }
  Variables: {
    jwtPayload: JwtPayload
    db: DB
  }
}
