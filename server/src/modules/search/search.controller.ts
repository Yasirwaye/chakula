import type { FastifyRequest, FastifyReply } from 'fastify'
import * as searchService from './search.service.js'
import { ValidationError } from '../../utils/errors.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/search
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function search(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const query = request.query as Record<string, string>

  if (!query.q || query.q.trim().length < 2) {
    throw new ValidationError('Search query must be at least 2 characters', [
      { field: 'q', message: 'Minimum 2 characters required' },
    ])
  }

  const result = await searchService.search({
    query: query.q,
    type: (query.type as 'all' | 'restaurants' | 'dishes') ?? 'all',
    lat: query.lat ? parseFloat(query.lat) : undefined,
    lng: query.lng ? parseFloat(query.lng) : undefined,
    limit: query.limit ? parseInt(query.limit) : 10,
  })

  reply.send({ success: true, data: result })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/search/suggestions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getSuggestions(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const query = request.query as Record<string, string>

  const suggestions = await searchService.getSuggestions(query.q ?? '')

  reply.send({
    success: true,
    data: { suggestions },
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/search/trending
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getTrendingSearches(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const trending = await searchService.getTrendingSearches()

  reply.send({
    success: true,
    data: { trending },
  })
}