import { prisma } from '../../config/database.js'
import { redis } from '../../config/redis.js'
import { logger } from '../../config/logger.js'
import { isOpenNow, computeDeliveryFee, computeEstimatedDelivery } from '../../utils/geo.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GLOBAL SEARCH — restaurants + dishes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function search(params: {
  query: string
  type?: 'all' | 'restaurants' | 'dishes'
  lat?: number
  lng?: number
  limit?: number
}) {
  const { query, type = 'all', lat, lng, limit = 10 } = params

  if (!query || query.trim().length < 2) {
    return { query, restaurants: [], dishes: [], totalRestaurants: 0, totalDishes: 0 }
  }

  const cleanQuery = query.trim().toLowerCase()

  const [restaurants, dishes] = await Promise.all([
    // Search restaurants
    type !== 'dishes'
      ? searchRestaurants(cleanQuery, limit, lat, lng)
      : Promise.resolve([]),

    // Search dishes (menu items)
    type !== 'restaurants'
      ? searchDishes(cleanQuery, limit)
      : Promise.resolve([]),
  ])

  // Save to trending searches (async, non-blocking)
  saveTrendingSearch(cleanQuery).catch(() => {})

  return {
    query,
    restaurants,
    dishes,
    totalRestaurants: restaurants.length,
    totalDishes: dishes.length,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEARCH RESTAURANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function searchRestaurants(
  query: string,
  limit: number,
  lat?: number,
  lng?: number
) {
  // Try full-text search first (uses tsvector)
  try {
    const ftsResults = await prisma.$queryRaw<Array<{
      id: string
      name: string
      slug: string
      logo: string | null
      cuisine_types: string[]
      avg_rating: number
      latitude: number
      longitude: number
      delivery_fee_base: number
      delivery_fee_per_km: number
      avg_prep_time_minutes: number
      is_active: boolean
      operating_hours: Record<string, unknown>
      rank: number
    }>>`
      SELECT
        id::text,
        name,
        slug,
        logo,
        "cuisineTypes" as cuisine_types,
        "avgRating" as avg_rating,
        latitude,
        longitude,
        "deliveryFeeBase" as delivery_fee_base,
        "deliveryFeePerKm" as delivery_fee_per_km,
        "avgPrepTimeMinutes" as avg_prep_time_minutes,
        "isActive" as is_active,
        "operatingHours" as operating_hours,
        ts_rank(search_vector, plainto_tsquery('english', ${query})) AS rank
      FROM restaurants
      WHERE
        search_vector @@ plainto_tsquery('english', ${query})
        AND status = 'APPROVED'
        AND "isVerified" = true
      ORDER BY rank DESC
      LIMIT ${limit}
    `

    return ftsResults.map((r) => {
      const operatingHours = r.operating_hours as Record<string, { open: string; close: string; closed: boolean }>
      const { isOpen } = isOpenNow(operatingHours, r.is_active)
      const distanceKm = lat && lng ? calculateApproxDistance(lat, lng, r.latitude, r.longitude) : 0

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        logo: r.logo,
        cuisineTypes: r.cuisine_types,
        avgRating: r.avg_rating,
        distanceKm,
        isOpen,
        matchedOn: 'name' as const,
      }
    })
  } catch (error) {
    // Fall back to LIKE search if FTS not available
    logger.warn('FTS search failed, falling back to LIKE search')
    return searchRestaurantsFallback(query, limit, lat, lng)
  }
}

async function searchRestaurantsFallback(
  query: string,
  limit: number,
  lat?: number,
  lng?: number
) {
  const restaurants = await prisma.restaurant.findMany({
    where: {
      status: 'APPROVED',
      isVerified: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { area: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      cuisineTypes: true,
      avgRating: true,
      latitude: true,
      longitude: true,
      isActive: true,
      operatingHours: true,
    },
    take: limit,
    orderBy: { avgRating: 'desc' },
  })

  return restaurants.map((r) => {
    const operatingHours = r.operatingHours as Record<string, { open: string; close: string; closed: boolean }>
    const { isOpen } = isOpenNow(operatingHours, r.isActive)
    const distanceKm = lat && lng ? calculateApproxDistance(lat, lng, r.latitude, r.longitude) : 0

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      logo: r.logo,
      cuisineTypes: r.cuisineTypes,
      avgRating: r.avgRating,
      distanceKm,
      isOpen,
      matchedOn: 'name' as const,
    }
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEARCH DISHES (menu items)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function searchDishes(query: string, limit: number) {
  try {
    const ftsResults = await prisma.$queryRaw<Array<{
      id: string
      name: string
      base_price: number
      avg_rating: number
      images: string[]
      restaurant_id: string
      restaurant_name: string
      restaurant_logo: string | null
      restaurant_slug: string
      restaurant_is_active: boolean
      restaurant_operating_hours: Record<string, unknown>
      rank: number
    }>>`
      SELECT
        mi.id::text,
        mi.name,
        mi."basePrice" as base_price,
        mi."avgRating" as avg_rating,
        mi.images,
        r.id::text as restaurant_id,
        r.name as restaurant_name,
        r.logo as restaurant_logo,
        r.slug as restaurant_slug,
        r."isActive" as restaurant_is_active,
        r."operatingHours" as restaurant_operating_hours,
        ts_rank(mi.search_vector, plainto_tsquery('english', ${query})) AS rank
      FROM menu_items mi
      JOIN restaurants r ON mi."restaurantId" = r.id
      WHERE
        mi.search_vector @@ plainto_tsquery('english', ${query})
        AND mi."isAvailable" = true
        AND mi."deletedAt" IS NULL
        AND r.status = 'APPROVED'
        AND r."isVerified" = true
      ORDER BY rank DESC, mi."totalOrders" DESC
      LIMIT ${limit}
    `

    return ftsResults.map((r) => {
      const operatingHours = r.restaurant_operating_hours as Record<string, { open: string; close: string; closed: boolean }>
      const { isOpen } = isOpenNow(operatingHours, r.restaurant_is_active)

      return {
        id: r.id,
        name: r.name,
        image: r.images?.[0] ?? null,
        basePrice: r.base_price,
        avgRating: r.avg_rating,
        restaurant: {
          id: r.restaurant_id,
          name: r.restaurant_name,
          logo: r.restaurant_logo,
          slug: r.restaurant_slug,
          isOpen,
          distanceKm: 0,
        },
      }
    })
  } catch (error) {
    logger.warn('FTS dish search failed, falling back to LIKE search')
    return searchDishesFallback(query, limit)
  }
}

async function searchDishesFallback(query: string, limit: number) {
  const items = await prisma.menuItem.findMany({
    where: {
      isAvailable: true,
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
      restaurant: { status: 'APPROVED', isVerified: true },
    },
    select: {
      id: true,
      name: true,
      basePrice: true,
      avgRating: true,
      images: true,
      restaurant: {
        select: {
          id: true,
          name: true,
          logo: true,
          slug: true,
          isActive: true,
          operatingHours: true,
        },
      },
    },
    take: limit,
    orderBy: { totalOrders: 'desc' },
  })

  return items.map((item) => {
    const operatingHours = item.restaurant.operatingHours as Record<string, { open: string; close: string; closed: boolean }>
    const { isOpen } = isOpenNow(operatingHours, item.restaurant.isActive)

    return {
      id: item.id,
      name: item.name,
      image: item.images?.[0] ?? null,
      basePrice: item.basePrice,
      avgRating: item.avgRating,
      restaurant: {
        id: item.restaurant.id,
        name: item.restaurant.name,
        logo: item.restaurant.logo,
        slug: item.restaurant.slug,
        isOpen,
        distanceKm: 0,
      },
    }
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTOCOMPLETE SUGGESTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getSuggestions(partialQuery: string): Promise<string[]> {
  if (!partialQuery || partialQuery.length < 1) return []

  const cacheKey = `cache:suggestions:${partialQuery.toLowerCase()}`
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const clean = partialQuery.trim()

  const [restaurants, dishes] = await Promise.all([
    prisma.restaurant.findMany({
      where: {
        status: 'APPROVED',
        isVerified: true,
        name: { startsWith: clean, mode: 'insensitive' },
      },
      select: { name: true },
      take: 5,
      orderBy: { avgRating: 'desc' },
    }),

    prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        deletedAt: null,
        name: { startsWith: clean, mode: 'insensitive' },
        restaurant: { status: 'APPROVED', isVerified: true },
      },
      select: { name: true },
      take: 5,
      orderBy: { totalOrders: 'desc' },
    }),
  ])

  const suggestions = [
    ...restaurants.map((r) => r.name),
    ...dishes.map((d) => d.name),
  ]

  // Deduplicate
  const unique = [...new Set(suggestions)].slice(0, 8)

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(unique))

  return unique
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRENDING SEARCHES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getTrendingSearches(): Promise<string[]> {
  const cacheKey = 'cache:trending:searches'
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  // Get top searched terms from Redis sorted set
  const trending = await redis.zrevrange('search:trending', 0, 9)

  if (trending.length > 0) {
    await redis.setex(cacheKey, 1800, JSON.stringify(trending))
    return trending
  }

  // Fallback: return popular menu item names
  const popular = await prisma.menuItem.findMany({
    where: { isAvailable: true, deletedAt: null },
    select: { name: true },
    orderBy: { totalOrders: 'desc' },
    take: 8,
  })

  const defaults = popular.map((p) => p.name)
  await redis.setex(cacheKey, 1800, JSON.stringify(defaults))

  return defaults
}

async function saveTrendingSearch(query: string): Promise<void> {
  try {
    // Use Redis sorted set — score = search count
    await redis.zincrby('search:trending', 1, query)
    // Trim to top 100 searches
    await redis.zremrangebyrank('search:trending', 0, -101)
    // Expire the set after 7 days
    await redis.expire('search:trending', 7 * 24 * 60 * 60)
  } catch {
    // Non-critical
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function calculateApproxDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10
}