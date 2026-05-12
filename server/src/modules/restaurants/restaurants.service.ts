import { prisma } from '../../config/database.js'
import { redis, RedisKeys } from '../../config/redis.js'
import { logger } from '../../config/logger.js'
import { getNearbyRestaurantIds, computeDeliveryFee, computeEstimatedDelivery, isOpenNow } from '../../utils/geo.js'
import { env } from '../../config/env.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESTAURANT SELECT — safe fields for listing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const RESTAURANT_CARD_SELECT = {
  id: true,
  name: true,
  slug: true,
  logo: true,
  coverImage: true,
  cuisineTypes: true,
  tags: true,
  area: true,
  city: true,
  latitude: true,
  longitude: true,
  avgRating: true,
  totalReviews: true,
  totalOrders: true,
  avgPrepTimeMinutes: true,
  deliveryFeeBase: true,
  deliveryFeePerKm: true,
  deliveryRadiusKm: true,
  minimumOrder: true,
  isActive: true,
  isFeatured: true,
  isPromoted: true,
  promotedUntil: true,
  isHalalCertified: true,
  isVegetarianFriendly: true,
  operatingHours: true,
  createdAt: true,
} as const

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET RESTAURANTS (with filters + geo)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getRestaurants(params: {
  lat?: number
  lng?: number
  radius?: number
  page?: number
  limit?: number
  sort?: string
  cuisine?: string[]
  mood?: string
  minRating?: number
  maxDelivery?: number
  maxFee?: number
  isOpen?: boolean
  isNew?: boolean
  search?: string
  userId?: string
}) {
  const {
    lat,
    lng,
    radius = 5,
    page = 1,
    limit = 20,
    sort = 'distance',
    cuisine,
    minRating,
    isOpen,
    isNew,
    search,
    userId,
  } = params

  // Build where clause
  const where: Record<string, unknown> = {
    status: 'APPROVED',
    isVerified: true,
  }

  if (cuisine && cuisine.length > 0) {
    where.cuisineTypes = { hasSome: cuisine }
  }

  if (minRating) {
    where.avgRating = { gte: minRating }
  }

  if (isNew) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    where.createdAt = { gte: thirtyDaysAgo }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { area: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Get nearby restaurant IDs if location provided
  let nearbyMap: Map<string, number> | null = null
  if (lat && lng) {
    const nearby = await getNearbyRestaurantIds(lat, lng, radius)
    nearbyMap = new Map(nearby.map((r) => [r.id, r.distanceKm]))
    where.id = { in: Array.from(nearbyMap.keys()) }
  }

  // Build sort
  const orderBy: Record<string, unknown>[] = []
  switch (sort) {
    case 'rating':
      orderBy.push({ avgRating: 'desc' })
      break
    case 'new':
      orderBy.push({ createdAt: 'desc' })
      break
    case 'distance':
    default:
      orderBy.push({ isFeatured: 'desc' })
      orderBy.push({ avgRating: 'desc' })
      break
  }

  // Query
  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      select: RESTAURANT_CARD_SELECT,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.restaurant.count({ where }),
  ])

  // Get user favorites if authenticated
  let favoriteIds = new Set<string>()
  if (userId) {
    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      select: { restaurantId: true },
    })
    favoriteIds = new Set(favorites.map((f) => f.restaurantId))
  }

  // Enrich with computed fields
  const enriched = restaurants.map((r) => {
    const distanceKm = nearbyMap?.get(r.id) ?? 0
    const operatingHours = r.operatingHours as Record<string, { open: string; close: string; closed: boolean }>
    const { isOpen: open, closesAt, opensAt } = isOpenNow(operatingHours, r.isActive)
    const deliveryFee = computeDeliveryFee(distanceKm, r.deliveryFeeBase, r.deliveryFeePerKm)
    const estimatedDelivery = computeEstimatedDelivery(r.avgPrepTimeMinutes, distanceKm)

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      logo: r.logo,
      coverImage: r.coverImage,
      cuisineTypes: r.cuisineTypes,
      tags: r.tags,
      area: r.area,
      city: r.city,
      latitude: r.latitude,
      longitude: r.longitude,
      distanceKm,
      avgRating: r.avgRating,
      totalReviews: r.totalReviews,
      avgPrepTimeMinutes: r.avgPrepTimeMinutes,
      estimatedDeliveryMinutes: estimatedDelivery,
      deliveryFeeBase: r.deliveryFeeBase,
      deliveryFee,
      minimumOrder: r.minimumOrder,
      isActive: r.isActive,
      isOpen: open,
      closesAt,
      opensAt,
      isHalalCertified: r.isHalalCertified,
      isVegetarianFriendly: r.isVegetarianFriendly,
      isFeatured: r.isFeatured,
      isNew: isRestaurantNew(r.createdAt),
      hasActivePromo: r.isPromoted && (!r.promotedUntil || r.promotedUntil > new Date()),
      isFavorited: favoriteIds.has(r.id),
    }
  })

  // If sorting by distance, sort enriched results
  if (sort === 'distance' && nearbyMap) {
    enriched.sort((a, b) => a.distanceKm - b.distanceKm)
  }

  // Filter open restaurants if requested
  const filtered = isOpen ? enriched.filter((r) => r.isOpen) : enriched

  return {
    restaurants: filtered,
    total,
    page,
    limit,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET RESTAURANT DETAIL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getRestaurantDetail(
  idOrSlug: string,
  lat?: number,
  lng?: number,
  userId?: string
) {
  const cacheKey = RedisKeys.cacheRestaurant(idOrSlug)
  const cached = await redis.get(cacheKey)
  if (cached) {
    const data = JSON.parse(cached)
    return enrichRestaurantDetail(data, lat, lng, userId)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Detect if idOrSlug is a UUID or a slug
  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const isUUID = UUID_REGEX.test(idOrSlug)

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      // Only search by id if it looks like a UUID
      ...(isUUID ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug }),
      status: 'APPROVED',
      isVerified: true,
    },
    select: {
      ...RESTAURANT_CARD_SELECT,
      description: true,
      story: true,
      images: true,
      phone: true,
      email: true,
      website: true,
      instagramHandle: true,
      facebookUrl: true,
      isVeganFriendly: true,
      deliveryRadiusKm: true,
    },
  })

  if (!restaurant) return null

  const ratingBreakdown = await getRatingBreakdown(restaurant.id)
  const fullData = { ...restaurant, ratingBreakdown }

  await redis.setex(cacheKey, 600, JSON.stringify(fullData))

  return enrichRestaurantDetail(fullData, lat, lng, userId)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET RESTAURANT MENU
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getRestaurantMenu(restaurantId: string) {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Validate it's a UUID before querying
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_REGEX.test(restaurantId)) {
    // Not a UUID — try to find by slug first
    const bySlug = await prisma.restaurant.findUnique({
      where: { slug: restaurantId },
      select: { id: true },
    })
    if (!bySlug) return null
    restaurantId = bySlug.id
  }

  const cacheKey = RedisKeys.cacheMenu(restaurantId)
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, name: true, isActive: true },
  })

  if (!restaurant) return null

  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId, isVisible: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      sortOrder: true,
      menuItems: {
        where: { isAvailable: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          basePrice: true,
          images: true,
          isSpicy: true,
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          isChefsPick: true,
          isPopular: true,
          isNew: true,
          isAvailable: true,
          prepTimeMinutes: true,
          calories: true,
          allergens: true,
          moodTags: true,
          customizationGroups: true,
          avgRating: true,
          totalOrders: true,
          sortOrder: true,
        },
      },
    },
  })

  const chefsPicks = categories
    .flatMap((c) => c.menuItems)
    .filter((item) => item.isChefsPick)
    .slice(0, 5)

  const result = {
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    isActive: restaurant.isActive,
    categories,
    chefsPicks,
  }

  await redis.setex(cacheKey, 600, JSON.stringify(result))

  return result
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET RESTAURANT REVIEWS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getRestaurantReviews(
  restaurantId: string,
  params: { page?: number; limit?: number; rating?: number; hasPhotos?: boolean }
) {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Resolve slug to UUID if needed
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_REGEX.test(restaurantId)) {
    const bySlug = await prisma.restaurant.findUnique({
      where: { slug: restaurantId },
      select: { id: true },
    })
    if (!bySlug) return { reviews: [], total: 0, page: 1, limit: 10 }
    restaurantId = bySlug.id
  }

  const { page = 1, limit = 10, rating, hasPhotos } = params

  const where: Record<string, unknown> = {
    restaurantId,
    isPublic: true,
  }

  if (rating) where.overallRating = { gte: rating, lt: rating + 1 }
  if (hasPhotos) where.photos = { isEmpty: false }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        overallRating: true,
        foodRating: true,
        deliveryRating: true,
        comment: true,
        photos: true,
        restaurantTags: true,
        restaurantResponse: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ])

  const safeReviews = reviews.map((r) => ({
    ...r,
    customer: {
      ...r.customer,
      name: maskName(r.customer.name),
    },
  }))

  return { reviews: safeReviews, total, page, limit }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET FEATURED RESTAURANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getFeaturedRestaurants(
  lat?: number,
  lng?: number,
  limit = 10,
  userId?: string
) {
  const restaurants = await prisma.restaurant.findMany({
    where: { status: 'APPROVED', isVerified: true, isFeatured: true },
    select: RESTAURANT_CARD_SELECT,
    orderBy: { avgRating: 'desc' },
    take: limit,
  })

  return enrichRestaurantList(restaurants, lat, lng, userId)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET TRENDING RESTAURANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getTrendingRestaurants(
  lat?: number,
  lng?: number,
  limit = 10,
  userId?: string
) {
  // Trending = most orders in last 7 days (using totalOrders as proxy for MVP)
  const restaurants = await prisma.restaurant.findMany({
    where: { status: 'APPROVED', isVerified: true, isActive: true },
    select: { ...RESTAURANT_CARD_SELECT, totalOrders: true },
    orderBy: [{ totalOrders: 'desc' }, { avgRating: 'desc' }],
    take: limit,
  })

  const enriched = await enrichRestaurantList(restaurants, lat, lng, userId)

  return enriched.map((r, i) => ({
    ...r,
    trendingScore: 100 - i * 10,
  }))
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOME DATA (single call — reduces app startup requests)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getHomeData(
  lat?: number,
  lng?: number,
  userId?: string
) {
  const cacheKey = lat && lng
    ? RedisKeys.cacheHomeData(lat, lng)
    : 'cache:home:default'

  const cached = await redis.get(cacheKey)
  if (cached) {
    const data = JSON.parse(cached)
    // Favorites are user-specific — always compute fresh
    if (userId) {
      data.nearbyRestaurants = await addFavoritedFlag(data.nearbyRestaurants, userId)
      data.featuredRestaurants = await addFavoritedFlag(data.featuredRestaurants, userId)
    }
    return data
  }

  const [banners, featured, nearby, trending, newRestaurants] = await Promise.all([
    // Banners
    prisma.appBanner.findMany({
      where: {
        isActive: true,
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
        startsAt: { lte: new Date() },
      },
      orderBy: { sortOrder: 'asc' },
      take: 5,
    }),

    // Featured restaurants
    getFeaturedRestaurants(lat, lng, 8, userId),

    // Nearby restaurants
    lat && lng
      ? getRestaurants({ lat, lng, radius: 5, limit: 10, sort: 'distance', userId })
      : { restaurants: [] },

    // Trending
    getTrendingRestaurants(lat, lng, 8, userId),

    // New restaurants (last 30 days)
    prisma.restaurant.findMany({
      where: {
        status: 'APPROVED',
        isVerified: true,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: RESTAURANT_CARD_SELECT,
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const result = {
    banners,
    featuredRestaurants: featured,
    nearbyRestaurants: 'restaurants' in nearby ? nearby.restaurants : nearby,
    trendingRestaurants: trending,
    newRestaurants: await enrichRestaurantList(newRestaurants, lat, lng, userId),
    activeOrder: null, // Will be populated in orders sprint
    moods: getMoodCounts(),
  }

  // Cache for 5 minutes (banners + nearby change slowly)
  await redis.setex(cacheKey, 300, JSON.stringify(result))

  return result
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOGGLE FAVORITE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function toggleFavorite(userId: string, restaurantId: string) {
  const existing = await prisma.userFavorite.findUnique({
    where: { userId_restaurantId: { userId, restaurantId } },
  })

  if (existing) {
    await prisma.userFavorite.delete({
      where: { userId_restaurantId: { userId, restaurantId } },
    })
    return { isFavorited: false }
  }

  await prisma.userFavorite.create({
    data: { userId, restaurantId },
  })
  return { isFavorited: true }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function isRestaurantNew(createdAt: Date): boolean {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return createdAt > thirtyDaysAgo
}

function maskName(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0]?.charAt(0).toUpperCase() + '.' ?? name
  return `${parts[0]} ${parts[parts.length - 1]?.charAt(0).toUpperCase()}.`
}

async function getRatingBreakdown(restaurantId: string) {
  const reviews = await prisma.review.groupBy({
    by: ['overallRating'],
    where: { restaurantId, isPublic: true },
    _count: true,
  })

  const total = reviews.reduce((sum, r) => sum + r._count, 0)
  const breakdown: Record<string, number> = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }

  for (const r of reviews) {
    const star = String(Math.round(r.overallRating))
    if (breakdown[star] !== undefined && total > 0) {
      breakdown[star] = Math.round((r._count / total) * 100)
    }
  }

  return breakdown
}

async function enrichRestaurantDetail(
  restaurant: Record<string, unknown>,
  lat?: number,
  lng?: number,
  userId?: string
) {
  const r = restaurant as {
    id: string
    latitude: number
    longitude: number
    deliveryFeeBase: number
    deliveryFeePerKm: number
    avgPrepTimeMinutes: number
    isActive: boolean
    operatingHours: Record<string, { open: string; close: string; closed: boolean }>
    createdAt: Date | string
    ratingBreakdown?: Record<string, number>
  }

  const distanceKm = lat && lng
    ? (await getNearbyRestaurantIds(lat, lng, 50)).find((n) => n.id === r.id)?.distanceKm ?? 0
    : 0

  const { isOpen, closesAt, opensAt } = isOpenNow(r.operatingHours, r.isActive)
  const deliveryFee = computeDeliveryFee(distanceKm, r.deliveryFeeBase, r.deliveryFeePerKm)
  const estimatedDelivery = computeEstimatedDelivery(r.avgPrepTimeMinutes, distanceKm)

  let isFavorited = false
  if (userId) {
    const fav = await prisma.userFavorite.findUnique({
      where: { userId_restaurantId: { userId, restaurantId: r.id } },
    })
    isFavorited = !!fav
  }

  return {
    ...restaurant,
    distanceKm,
    deliveryFee,
    estimatedDeliveryMinutes: estimatedDelivery,
    isOpen,
    closesAt,
    opensAt,
    isFavorited,
    isNew: isRestaurantNew(new Date(r.createdAt as string)),
  }
}

async function enrichRestaurantList(
  restaurants: Array<{
    id: string
    latitude: number
    longitude: number
    deliveryFeeBase: number
    deliveryFeePerKm: number
    avgPrepTimeMinutes: number
    isActive: boolean
    operatingHours: unknown
    isFeatured: boolean
    isPromoted: boolean
    promotedUntil: Date | null
    createdAt: Date
    [key: string]: unknown
  }>,
  lat?: number,
  lng?: number,
  userId?: string
) {
  let nearbyMap: Map<string, number> | null = null
  if (lat && lng && restaurants.length > 0) {
    const nearbyIds = restaurants.map((r) => r.id)
    const nearby = await getNearbyRestaurantIds(lat, lng, 50)
    nearbyMap = new Map(nearby.filter((n) => nearbyIds.includes(n.id)).map((n) => [n.id, n.distanceKm]))
  }

  let favoriteIds = new Set<string>()
  if (userId) {
    const favorites = await prisma.userFavorite.findMany({
      where: { userId, restaurantId: { in: restaurants.map((r) => r.id) } },
      select: { restaurantId: true },
    })
    favoriteIds = new Set(favorites.map((f) => f.restaurantId))
  }

  return restaurants.map((r) => {
    const distanceKm = nearbyMap?.get(r.id) ?? 0
    const operatingHours = r.operatingHours as Record<string, { open: string; close: string; closed: boolean }>
    const { isOpen, closesAt, opensAt } = isOpenNow(operatingHours, r.isActive)
    const deliveryFee = computeDeliveryFee(distanceKm, r.deliveryFeeBase, r.deliveryFeePerKm)
    const estimatedDelivery = computeEstimatedDelivery(r.avgPrepTimeMinutes, distanceKm)

    return {
      ...r,
      distanceKm,
      deliveryFee,
      estimatedDeliveryMinutes: estimatedDelivery,
      isOpen,
      closesAt,
      opensAt,
      isFavorited: favoriteIds.has(r.id),
      isNew: isRestaurantNew(r.createdAt),
      hasActivePromo: r.isPromoted && (!r.promotedUntil || r.promotedUntil > new Date()),
    }
  })
}

async function addFavoritedFlag(
  restaurants: Array<{ id: string; [key: string]: unknown }>,
  userId: string
) {
  if (!restaurants.length) return restaurants
  const favorites = await prisma.userFavorite.findMany({
    where: { userId, restaurantId: { in: restaurants.map((r) => r.id) } },
    select: { restaurantId: true },
  })
  const favoriteIds = new Set(favorites.map((f) => f.restaurantId))
  return restaurants.map((r) => ({ ...r, isFavorited: favoriteIds.has(r.id) }))
}

function getMoodCounts() {
  return [
    { mood: 'COMFORT_FOOD', label: '😴 Comfort food' },
    { mood: 'QUICK_BITE', label: '⚡ Quick bite' },
    { mood: 'DATE_NIGHT', label: '💑 Date night' },
    { mood: 'HEALTHY', label: '🌱 Eating healthy' },
    { mood: 'ADVENTUROUS', label: '🌍 Adventurous' },
    { mood: 'BUDGET_FRIENDLY', label: '💰 Budget friendly' },
    { mood: 'CELEBRATION', label: '🎉 Celebrating' },
    { mood: 'SPICY', label: '🌶️ Feeling spicy' },
    { mood: 'SHARING', label: '🤝 Sharing' },
    { mood: 'LATE_NIGHT', label: '🌙 Late night' },
  ]
}