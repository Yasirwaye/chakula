import type { FastifyRequest, FastifyReply } from 'fastify'
import * as restaurantsService from './restaurants.service.js'
import { NotFoundError } from '../../utils/errors.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/restaurants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getRestaurants(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const query = request.query as Record<string, string>

  const params = {
    lat: query.lat ? parseFloat(query.lat) : undefined,
    lng: query.lng ? parseFloat(query.lng) : undefined,
    radius: query.radius ? parseFloat(query.radius) : 5,
    page: query.page ? parseInt(query.page) : 1,
    limit: Math.min(query.limit ? parseInt(query.limit) : 20, 50),
    sort: query.sort ?? 'distance',
    cuisine: query.cuisine ? (Array.isArray(query.cuisine) ? query.cuisine : [query.cuisine]) : undefined,
    minRating: query.minRating ? parseFloat(query.minRating) : undefined,
    isOpen: query.isOpen === 'true',
    isNew: query.isNew === 'true',
    search: query.search,
    userId: request.user?.userId,
  }

  const result = await restaurantsService.getRestaurants(params)

  const { getPaginationMeta } = await import('@chakula/shared-utils')
  const meta = getPaginationMeta(result.total, result.page, result.limit)

  reply.send({
    success: true,
    data: result.restaurants,
    meta,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/restaurants/featured
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getFeaturedRestaurants(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const query = request.query as Record<string, string>

  const restaurants = await restaurantsService.getFeaturedRestaurants(
    query.lat ? parseFloat(query.lat) : undefined,
    query.lng ? parseFloat(query.lng) : undefined,
    query.limit ? parseInt(query.limit) : 10,
    request.user?.userId
  )

  reply.send({ success: true, data: restaurants })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/restaurants/trending
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getTrendingRestaurants(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const query = request.query as Record<string, string>

  const restaurants = await restaurantsService.getTrendingRestaurants(
    query.lat ? parseFloat(query.lat) : undefined,
    query.lng ? parseFloat(query.lng) : undefined,
    query.limit ? parseInt(query.limit) : 10,
    request.user?.userId
  )

  reply.send({ success: true, data: restaurants })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/restaurants/:idOrSlug
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getRestaurantDetail(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const { idOrSlug } = request.params as { idOrSlug: string }
  const query = request.query as Record<string, string>

  const restaurant = await restaurantsService.getRestaurantDetail(
    idOrSlug,
    query.lat ? parseFloat(query.lat) : undefined,
    query.lng ? parseFloat(query.lng) : undefined,
    request.user?.userId
  )

  if (!restaurant) {
    throw new NotFoundError('Restaurant')
  }

  reply.send({ success: true, data: restaurant })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/restaurants/:id/menu
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getRestaurantMenu(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const { id } = request.params as { id: string }

  const menu = await restaurantsService.getRestaurantMenu(id)

  if (!menu) {
    throw new NotFoundError('Restaurant menu')
  }

  reply.send({ success: true, data: menu })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/restaurants/:id/reviews
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getRestaurantReviews(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const { id } = request.params as { id: string }
  const query = request.query as Record<string, string>

  const result = await restaurantsService.getRestaurantReviews(id, {
    page: query.page ? parseInt(query.page) : 1,
    limit: query.limit ? parseInt(query.limit) : 10,
    rating: query.rating ? parseInt(query.rating) : undefined,
    hasPhotos: query.hasPhotos === 'true',
  })

  const { getPaginationMeta } = await import('@chakula/shared-utils')

  reply.send({
    success: true,
    data: result.reviews,
    meta: getPaginationMeta(result.total, result.page, result.limit),
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/users/me/favorites/:restaurantId
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function toggleFavorite(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const { restaurantId } = request.params as { restaurantId: string }
  const userId = request.user.userId

  const result = await restaurantsService.toggleFavorite(userId, restaurantId)

  reply.send({
    success: true,
    message: result.isFavorited ? 'Added to favorites' : 'Removed from favorites',
    data: result,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/home-data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getHomeData(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const query = request.query as Record<string, string>

  const data = await restaurantsService.getHomeData(
    query.lat ? parseFloat(query.lat) : undefined,
    query.lng ? parseFloat(query.lng) : undefined,
    request.user?.userId
  )

  reply.send({ success: true, data })
}