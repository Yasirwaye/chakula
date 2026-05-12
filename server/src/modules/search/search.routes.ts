import type { FastifyInstance } from 'fastify'
import * as searchController from './search.controller.js'

export async function searchRoutes(fastify: FastifyInstance): Promise<void> {
  // Global search
  fastify.get('/search', {
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
  }, searchController.search)

  // Autocomplete suggestions
  fastify.get('/search/suggestions', {
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
  }, searchController.getSuggestions)

  // Trending searches
  fastify.get('/search/trending', {
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
  }, searchController.getTrendingSearches)
}