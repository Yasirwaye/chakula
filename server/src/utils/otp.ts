import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { redis, RedisKeys } from '../config/redis.js'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OTP GENERATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function generateOTP(length = 6): string {
  // Cryptographically secure random OTP
  const digits = '0123456789'
  let otp = ''
  const randomBytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i]! % 10]
  }
  return otp
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORE OTP IN REDIS (hashed)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function storeOTP(phone: string, otp: string): Promise<void> {
  // Hash the OTP before storing — never store plain OTP
  const hash = await bcrypt.hash(otp, 10)
  const key = RedisKeys.otp(phone)
  const ttl = env.OTP_EXPIRY_MINUTES * 60 // Convert to seconds

  await redis.setex(key, ttl, hash)
  logger.info({ phone: maskPhone(phone) }, 'OTP stored in Redis')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VERIFY OTP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function verifyOTP(
  phone: string,
  otp: string
): Promise<{ valid: boolean; reason?: string }> {
  const attemptsKey = RedisKeys.otpAttempts(phone)
  const lockKey = RedisKeys.otpLock(phone)

  // Check if phone is locked (too many wrong attempts)
  const isLocked = await redis.exists(lockKey)
  if (isLocked) {
    const ttl = await redis.ttl(lockKey)
    const minutesLeft = Math.ceil(ttl / 60)
    return {
      valid: false,
      reason: `Too many attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`,
    }
  }

  // Get stored OTP hash
  const key = RedisKeys.otp(phone)
  const storedHash = await redis.get(key)

  if (!storedHash) {
    return { valid: false, reason: 'OTP expired or not found. Request a new one.' }
  }

  // Compare OTP with stored hash
  const isValid = await bcrypt.compare(otp, storedHash)

  if (!isValid) {
    // Increment attempt counter
    const attempts = await redis.incr(attemptsKey)
    await redis.expire(attemptsKey, env.OTP_EXPIRY_MINUTES * 60)

    const MAX_ATTEMPTS = 5
    const remaining = MAX_ATTEMPTS - attempts

    if (attempts >= MAX_ATTEMPTS) {
      // Lock the phone for 15 minutes
      await redis.setex(lockKey, 15 * 60, '1')
      await redis.del(key) // Delete the OTP
      await redis.del(attemptsKey)
      logger.warn({ phone: maskPhone(phone) }, 'Phone locked after too many OTP attempts')
      return {
        valid: false,
        reason: 'Too many wrong attempts. Phone locked for 15 minutes.',
      }
    }

    return {
      valid: false,
      reason: `Incorrect OTP. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
    }
  }

  // OTP is valid — clean up Redis
  await redis.del(key)
  await redis.del(attemptsKey)

  logger.info({ phone: maskPhone(phone) }, 'OTP verified successfully')
  return { valid: true }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHECK RATE LIMIT FOR OTP REQUESTS
// Max 3 OTP requests per phone per 10 minutes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function checkOTPRateLimit(
  phone: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = `otp:ratelimit:${phone}`
  const MAX_REQUESTS = 3
  const WINDOW_SECONDS = 10 * 60 // 10 minutes

  const count = await redis.incr(key)

  if (count === 1) {
    // First request — set expiry
    await redis.expire(key, WINDOW_SECONDS)
  }

  if (count > MAX_REQUESTS) {
    const ttl = await redis.ttl(key)
    return { allowed: false, retryAfter: ttl }
  }

  return { allowed: true }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function maskPhone(phone: string): string {
  if (phone.length < 8) return phone
  return phone.slice(0, 5) + '***' + phone.slice(-3)
}

export function getOTPExpiryInfo(): { expiresInSeconds: number; canResendAt: number } {
  const expiresInSeconds = env.OTP_EXPIRY_MINUTES * 60
  const canResendAt = Math.floor(Date.now() / 1000) + 60 // 60 second cooldown
  return { expiresInSeconds, canResendAt }
}