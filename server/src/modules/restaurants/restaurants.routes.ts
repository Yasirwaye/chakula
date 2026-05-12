import type { FastifyInstance } from 'fastify'
import * as restaurantsController from './restaurants.controller.js'

export async function restaurantRoutes(fastify: FastifyInstance): Promise<void> {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC ROUTES (auth optional — adds isFavorited if logged in)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Home screen data (single call)
  fastify.get('/home-data', {
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    preHandler: [
      async (request) => {
        // Optional auth — don't throw if no token
        try {
          await fastify.authenticate(request, {} as never)
        } catch {
          // Not authenticated — that's fine
        }
      },
    ],
  }, restaurantsController.getHomeData)

  // Restaurant list
  fastify.get('/restaurants', {
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    preHandler: [
      async (request) => {
        try { await fastify.authenticate(request, {} as never) } catch { }
      },
    ],
  }, restaurantsController.getRestaurants)

  // Featured
  fastify.get('/restaurants/featured', {
    preHandler: [
      async (request) => {
        try { await fastify.authenticate(request, {} as never) } catch { }
      },
    ],
  }, restaurantsController.getFeaturedRestaurants)

  // Trending
  fastify.get('/restaurants/trending', {
    preHandler: [
      async (request) => {
        try { await fastify.authenticate(request, {} as never) } catch { }
      },
    ],
  }, restaurantsController.getTrendingRestaurants)

  // Restaurant detail (by ID or slug)
  fastify.get('/restaurants/:idOrSlug', {
    preHandler: [
      async (request) => {
        try { await fastify.authenticate(request, {} as never) } catch { }
      },
    ],
  }, restaurantsController.getRestaurantDetail)

  // Restaurant menu
  fastify.get('/restaurants/:id/menu', {
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
  }, restaurantsController.getRestaurantMenu)

  // Restaurant reviews
  fastify.get('/restaurants/:id/reviews',
    restaurantsController.getRestaurantReviews
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROTECTED ROUTES (require auth)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Toggle favorite
  fastify.post('/users/me/favorites/:restaurantId', {
    preHandler: [fastify.authenticate],
  }, restaurantsController.toggleFavorite)

  fastify.delete('/users/me/favorites/:restaurantId', {
    preHandler: [fastify.authenticate],
  }, restaurantsController.toggleFavorite)
}