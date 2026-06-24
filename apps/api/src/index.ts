import Fastify from 'fastify'
import cors from '@fastify/cors'
import { adviceRoutes } from './routes/advice.js'
import { healthRoutes } from './routes/health.js'

const server = Fastify({ logger: true })

await server.register(cors, {
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
})

await server.register(healthRoutes)
await server.register(adviceRoutes, { prefix: '/api/advice' })

const port = Number(process.env.PORT) || 4000

try {
  await server.listen({ port, host: '0.0.0.0' })
  console.log(`API server running at http://localhost:${port}`)
} catch (err) {
  server.log.error(err)
  process.exit(1)
}
