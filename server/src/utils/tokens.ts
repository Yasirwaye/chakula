import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { env } from '../config/env.js'
import { redis, RedisKeys } from '../config/redis.js'
import { prisma } from '../config/database.js'
import type { JwtPayload } from '../plugins/auth.plugin.js'
import type { UserRole } from '@chakula/shared-types'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERATE ACCESS TOKEN (short-lived: 15min)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function generateAccessToken(payload: {
  userId: string
  role: UserRole
  sessionId: string
}): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'chakula-api',
    audience: 'chakula-app',
  } as jwt.SignOptions)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERATE REFRESH TOKEN (long-lived: 30 days)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function generateRefreshToken(): string {
  // Cryptographically random — not JWT (harder to tamper)
  return crypto.randomBytes(64).toString('hex')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORE REFRESH TOKEN IN DB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function storeRefreshToken(params: {
  userId: string
  refreshToken: string
  deviceId?: string
  deviceName?: string
  deviceOS?: string
  ipAddress?: string
  userAgent?: string
}): Promise<string> {
  const { userId, refreshToken, ...deviceInfo } = params

  // Hash the token before storing
  const tokenHash = await bcrypt.hash(refreshToken, 10)

  // Calculate expiry
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

  // Enforce max 5 sessions per user
  const sessionCount = await prisma.refreshToken.count({
    where: { userId, isRevoked: false },
  })

  if (sessionCount >= 5) {
    // Revoke the oldest session
    const oldest = await prisma.refreshToken.findFirst({
      where: { userId, isRevoked: false },
      orderBy: { createdAt: 'asc' },
    })
    if (oldest) {
      await prisma.refreshToken.update({
        where: { id: oldest.id },
        data: { isRevoked: true, revokedAt: new Date() },
      })
    }
  }

  const stored = await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      ...deviceInfo,
    },
  })

  return stored.id // Return the session ID (used in JWT payload)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VERIFY & ROTATE REFRESH TOKEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function verifyAndRotateRefreshToken(
  refreshToken: string
): Promise<{ userId: string; role: UserRole; sessionId: string } | null> {
  // Find all non-revoked tokens for potential match
  const tokens = await prisma.refreshToken.findMany({
    where: {
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    include: {
      // We need user role
    },
    take: 100, // Safety limit
  })

  // Find matching token by comparing hash
  let matchedToken: (typeof tokens)[0] | null = null
  for (const token of tokens) {
    const isMatch = await bcrypt.compare(refreshToken, token.tokenHash)
    if (isMatch) {
      matchedToken = token
      break
    }
  }

  if (!matchedToken) return null

  // Get user to confirm role
  const user = await prisma.user.findUnique({
    where: { id: matchedToken.userId },
    select: { id: true, role: true, status: true },
  })

  if (!user || user.status !== 'ACTIVE') return null

  // Revoke used token (rotation — prevents reuse)
  await prisma.refreshToken.update({
    where: { id: matchedToken.id },
    data: { isRevoked: true, revokedAt: new Date() },
  })

  return {
    userId: user.id,
    role: user.role as UserRole,
    sessionId: matchedToken.id,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REVOKE TOKEN (logout)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const tokens = await prisma.refreshToken.findMany({
    where: { isRevoked: false },
    take: 100,
  })

  for (const token of tokens) {
    const isMatch = await bcrypt.compare(refreshToken, token.tokenHash)
    if (isMatch) {
      await prisma.refreshToken.update({
        where: { id: token.id },
        data: { isRevoked: true, revokedAt: new Date() },
      })

      // Also blacklist current access token session in Redis
      await redis.setex(
        RedisKeys.tokenBlacklist(token.id),
        15 * 60, // 15 minutes (access token TTL)
        '1'
      )
      break
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REVOKE ALL TOKENS FOR USER (logout all devices)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function revokeAllUserTokens(userId: string): Promise<void> {
  const tokens = await prisma.refreshToken.findMany({
    where: { userId, isRevoked: false },
  })

  await prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true, revokedAt: new Date() },
  })

  // Blacklist all active sessions in Redis
  for (const token of tokens) {
    await redis.setex(
      RedisKeys.tokenBlacklist(token.id),
      15 * 60,
      '1'
    )
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERATE SETUP TOKEN (for new user registration)
// Short-lived token allowing only the register endpoint
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function generateSetupToken(phone: string): string {
  return jwt.sign(
    { phone, purpose: 'setup' },
    env.JWT_SECRET,
    { expiresIn: '30m' } // 30 minutes to complete registration
  )
}

export function verifySetupToken(token: string): { phone: string } | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      phone: string
      purpose: string
    }
    if (payload.purpose !== 'setup') return null
    return { phone: payload.phone }
  } catch {
    return null
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUILD AUTH RESPONSE (helper used across auth flows)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function buildAuthTokens(
  user: { id: string; role: string },
  deviceInfo: {
    deviceId?: string
    deviceName?: string
    deviceOS?: string
    ipAddress?: string
    userAgent?: string
  }
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; sessionId: string }> {
  const refreshToken = generateRefreshToken()

  const sessionId = await storeRefreshToken({
    userId: user.id,
    refreshToken,
    ...deviceInfo,
  })

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role as UserRole,
    sessionId,
  })

  return {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
    sessionId,
  }
}