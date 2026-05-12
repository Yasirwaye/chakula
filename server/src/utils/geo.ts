import { prisma } from '../config/database.js'
import { logger } from '../config/logger.js'
import { calculateDeliveryFee, calculateEstimatedDeliveryMinutes } from '@chakula/shared-utils'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEARBY RESTAURANTS (PostGIS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getNearbyRestaurantIds(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<Array<{ id: string; distanceKm: number }>> {
  try {
    const results = await prisma.$queryRaw<Array<{ id: string; distance_km: number }>>`
      SELECT
        id::text,
        ROUND(
          (ST_Distance(
            location::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) / 1000)::numeric,
          1
        ) AS distance_km
      FROM restaurants
      WHERE
        status = 'APPROVED'
        AND "isVerified" = true
        AND location IS NOT NULL
        AND ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radiusKm * 1000}
        )
      ORDER BY distance_km ASC
    `

    return results.map((r) => ({
      id: r.id,
      distanceKm: Number(r.distance_km),
    }))
  } catch (error) {
    logger.error({ error }, 'PostGIS nearby query failed — falling back to bounding box')
    return getFallbackNearbyIds(lat, lng, radiusKm)
  }
}

// Fallback without PostGIS (less accurate but works)
async function getFallbackNearbyIds(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<Array<{ id: string; distanceKm: number }>> {
  const latDelta = radiusKm / 111 // ~111km per degree latitude
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))

  const restaurants = await prisma.restaurant.findMany({
    where: {
      status: 'APPROVED',
      isVerified: true,
      latitude: { gte: lat - latDelta, lte: lat + latDelta },
      longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
    },
    select: { id: true, latitude: true, longitude: true },
  })

  return restaurants
    .map((r) => ({
      id: r.id,
      distanceKm: calculateHaversineDistance(lat, lng, r.latitude, r.longitude),
    }))
    .filter((r) => r.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
}

function calculateHaversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10
}

const toRad = (deg: number) => (deg * Math.PI) / 180

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELIVERY CALCULATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function computeDeliveryFee(
  distanceKm: number,
  restaurantBaseFee: number,
  restaurantPerKmFee: number
): number {
  return calculateDeliveryFee(distanceKm, restaurantBaseFee, restaurantPerKmFee)
}

export function computeEstimatedDelivery(
  prepTimeMinutes: number,
  distanceKm: number
): number {
  return calculateEstimatedDeliveryMinutes(prepTimeMinutes, distanceKm)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IS RESTAURANT OPEN NOW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function isOpenNow(
  operatingHours: Record<string, { open: string; close: string; closed: boolean }>,
  isActive: boolean
): { isOpen: boolean; closesAt: string | null; opensAt: string | null } {
  if (!isActive) return { isOpen: false, closesAt: null, opensAt: null }

  const now = new Date()
  // East Africa Time (UTC+3)
  const eatOffset = 3 * 60
  const eatTime = new Date(now.getTime() + eatOffset * 60 * 1000)

  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const dayKey = days[eatTime.getUTCDay()] ?? 'mon'
  const todayHours = operatingHours[dayKey]

  if (!todayHours || todayHours.closed) {
    // Find next open day
    const nextOpen = findNextOpenDay(operatingHours, eatTime.getUTCDay())
    return { isOpen: false, closesAt: null, opensAt: nextOpen }
  }

  const currentMinutes = eatTime.getUTCHours() * 60 + eatTime.getUTCMinutes()
  const [openH, openM] = todayHours.open.split(':').map(Number)
  const [closeH, closeM] = todayHours.close.split(':').map(Number)
  const openMinutes = (openH ?? 8) * 60 + (openM ?? 0)
  const closeMinutes = (closeH ?? 22) * 60 + (closeM ?? 0)

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return { isOpen: true, closesAt: todayHours.close, opensAt: null }
  }

  // Closed but today has hours — show next opening
  return {
    isOpen: false,
    closesAt: null,
    opensAt: currentMinutes < openMinutes ? todayHours.open : null,
  }
}

function findNextOpenDay(
  hours: Record<string, { open: string; close: string; closed: boolean }>,
  currentDayIndex: number
): string | null {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  for (let i = 1; i <= 7; i++) {
    const nextDay = days[(currentDayIndex + i) % 7]
    if (nextDay && hours[nextDay] && !hours[nextDay]!.closed) {
      return hours[nextDay]!.open
    }
  }
  return null
}