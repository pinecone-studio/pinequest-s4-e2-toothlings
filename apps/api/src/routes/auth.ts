import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@pinequest/types'

export const authRoutes = async (app: FastifyInstance): Promise<void> => {
  app.post<{ Body: { email: string; password: string } }>(
    '/api/auth/login',
    async (req, reply) => {
      const { email, password } = req.body
      const user = await app.prisma.user.findUnique({ where: { email } })
      if (!user || !user.passwordHash || !user.isActive) {
        return reply.code(401).send({ success: false, data: null, message: 'invalid_credentials' })
      }
      const ok = await bcrypt.compare(password, user.passwordHash)
      if (!ok) {
        return reply.code(401).send({ success: false, data: null, message: 'invalid_credentials' })
      }
      const token = await reply.jwtSign({
        sub: user.id,
        role: user.role as UserRole,
        schoolId: user.schoolId ?? undefined,
      })
      return {
        success: true,
        data: {
          token,
          user: { id: user.id, name: user.name, role: user.role, schoolId: user.schoolId },
        },
      }
    },
  )

  // Public self-registration. Role is always 'screener' — elevated roles are
  // assigned by an admin, never self-granted.
  app.post<{ Body: { name: string; email: string; password: string } }>(
    '/api/auth/register',
    async (req, reply) => {
      const { name, email, password } = req.body
      if (!name || !email || !password || password.length < 6) {
        return reply.code(400).send({ success: false, data: null, message: 'invalid_input' })
      }
      const existing = await app.prisma.user.findUnique({ where: { email } })
      if (existing) {
        return reply.code(409).send({ success: false, data: null, message: 'email_taken' })
      }
      const passwordHash = await bcrypt.hash(password, 10)
      const user = await app.prisma.user.create({
        data: { name, email, role: 'screener', passwordHash },
      })
      const token = await reply.jwtSign({ sub: user.id, role: 'screener' as UserRole })
      return reply.code(201).send({
        success: true,
        data: { token, user: { id: user.id, name: user.name, role: user.role } },
      })
    },
  )

  app.get('/api/auth/me', { preHandler: [app.authenticate] }, async (req) => {
    const user = await app.prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { id: true, email: true, name: true, role: true, schoolId: true, isActive: true },
    })
    return { success: true, data: user }
  })
}
