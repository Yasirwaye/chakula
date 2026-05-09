import Redis from 'ioredis'
import { env } from './env.js'
import { logger } from './logger.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Redis singleton
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const redisConfig = {
  host: new URL(env.REDIS_URL).hostname,
  port: Number(new URL(env.REDIS_URL).port) || 6379,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 5) {
      logger.error('Redis retry limit reached — giving up')
      return null // Stop retrying
    }
    const delay = Math.min(times * 500, 3000)
    logger.warn(`Redis reconnecting in ${delay}ms (attempt ${times})`)
    return delay
  },
  lazyConnect: true,
}

export const redis = new Redis(redisConfig)
export const redisSubscriber = new Redis(redisConfig) // Separate client for pub/sub

redis.on('connect', () => logger.info('✅ Redis connected'))
redis.on('error', (error) => logger.error({ error: error.message }, '❌ Redis error'))
redis.on('close', () => logger.warn('Redis connection closed'))
redis.on('reconnecting', () => logger.info('Redis reconnecting...'))

redisSubscriber.on('connect', () => logger.info('✅ Redis subscriber connected'))
redisSubscriber.on('error', (error) =>
  logger.error({ error: error.message }, '❌ Redis subscriber error')
)

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect()
    await redisSubscriber.connect()
    logger.info('✅ Redis connected')
  } catch (error) {
    logger.error({ error }, '❌ Redis connection failed')
    throw error
  }
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit()
  await redisSubscriber.quit()
  logger.info('Redis disconnected')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Redis key helpers — consistent key naming
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const RedisKeys = {
  // OTP
  otp: (phone: string) => `otp:${phone}`,
  otpAttempts: (phone: string) => `otp:attempts:${phone}`,
  otpLock: (phone: string) => `otp:lock:${phone}`,

  // Rate limiting
  rateLimit: (ip: string, endpoint: string) => `ratelimit:${ip}:${endpoint}`,

  // Sessions / JWT blacklist
  tokenBlacklist: (tokenId: string) => `blacklist:${tokenId}`,
  userSession: (userId: string, sessionId: string) => `session:${userId}:${sessionId}`,

  // Rider location
  riderLocation: (riderId: string) => `rider:location:${riderId}`,
  onlineRiders: () => `riders:online`,

  // Cache
  cacheRestaurantsNearby: (lat: number, lng: number, radius: number) =>
    `cache:restaurants:${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}`,
  cacheRestaurant: (id: string) => `cache:restaurant:${id}`,
  cacheMenu: (restaurantId: string) => `cache:menu:${restaurantId}`,
  cacheTrendingDishes: (city: string) => `cache:trending:${city}`,
  cacheHomeData: (lat: number, lng: number) =>
    `cache:home:${lat.toFixed(2)}:${lng.toFixed(2)}`,
  cacheAppConfig: () => `cache:app:config`,

  // Active orders
  restaurantActiveOrders: (restaurantId: string) =>
    `restaurant:orders:active:${restaurantId}`,

  // Payment
  paymentLock: (transactionId: string) => `payment:lock:${transactionId}`,
  paymentProcessed: (transactionId: string) => `payment:processed:${transactionId}`,

  // Delivery request
  deliveryRequest: (orderId: string) => `delivery:request:${orderId}`,
  deliveryRequestRiders: (orderId: string) => `delivery:request:riders:${orderId}`,
} as const