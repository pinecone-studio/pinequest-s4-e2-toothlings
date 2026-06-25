import { jwt, verify } from 'hono/jwt'
import { createMiddleware } from 'hono/factory'
import type { UserRole } from '@pinequest/types'
import type { AppEnv, JwtPayload } from '../types.js'

const SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'
const ALG = 'HS256' as const

export const authenticate = jwt({ secret: SECRET, alg: ALG })

export const authorize = (...roles: UserRole[]) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) return c.json({ success: false, data: null, message: 'unauthorized' }, 401)
    let payload: JwtPayload
    try {
      payload = (await verify(token, SECRET, ALG)) as unknown as JwtPayload
    } catch {
      return c.json({ success: false, data: null, message: 'unauthorized' }, 401)
    }
    if (!roles.includes(payload.role)) {
      return c.json({ success: false, data: null, message: 'forbidden' }, 403)
    }
    c.set('jwtPayload', payload)
    await next()
  })
