import type { FastifyInstance } from 'fastify'
import type { DentalAdvice, ApiResponse, PaginatedResponse } from '@pinequest/types'

export async function adviceRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { page?: string; limit?: string } }>(
    '/',
    async (request): Promise<PaginatedResponse<DentalAdvice>> => {
      const page = Number(request.query.page) || 1
      const limit = Number(request.query.limit) || 10

      // TODO: Replace with real database query
      return {
        data: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      }
    },
  )

  app.get<{ Params: { id: string } }>(
    '/:id',
    async (request, reply): Promise<ApiResponse<DentalAdvice | null>> => {
      const { id } = request.params

      // TODO: Replace with real database query
      void id
      reply.status(404)
      return { success: false, data: null, message: 'Advice not found' }
    },
  )
}
