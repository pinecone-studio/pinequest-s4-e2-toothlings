import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { prismaPlugin } from './plugins/prisma.js'
import { authPlugin } from './plugins/auth.js'
import { healthRoutes } from './routes/health.js'
import { authRoutes } from './routes/auth.js'
import { analyzeRoutes } from './routes/analyze.js'
import { screeningRoutes } from './routes/screenings.js'
import { schoolRoutes } from './routes/schools.js'
import { classRoutes } from './routes/classes.js'
import { childRoutes } from './routes/children.js'
import { followUpRoutes } from './routes/followups.js'

const start = async (): Promise<void> => {
  const server = Fastify({ logger: true })

  await server.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  })
  // Multipart must be registered before any route that calls req.parts().
  await server.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } })

  // Decorators first (fastify-plugin propagates them to every route context).
  await server.register(prismaPlugin)
  await server.register(authPlugin)

  // analyzeRoutes registered before screeningRoutes so POST /analyze isn't
  // shadowed by the /:id parameterised route in a future Fastify version.
  await server.register(healthRoutes)
  await server.register(authRoutes)
  await server.register(analyzeRoutes)
  await server.register(screeningRoutes)
  await server.register(schoolRoutes)
  await server.register(classRoutes)
  await server.register(childRoutes)
  await server.register(followUpRoutes)

  const port = Number(process.env.PORT) || 4000
  try {
    await server.listen({ port, host: '0.0.0.0' })
    console.log(`API server running at http://localhost:${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

void start()
