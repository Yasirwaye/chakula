import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { prisma } from '../config/database.js'
import { redis, RedisKeys } from '../config/redis.js'
import { AuthenticationError, AuthorizationError } from '../utils/errors.js'
import type { UserRole } from '@chakula/shared-types'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JWT Payload structure
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface JwtPayload {
  userId: string
  role: UserRole
  sessionId: string
  iat?: number
  exp?: number
}

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload
  }
}

async function authPlugin(fastify: FastifyInstance): Promise<void> {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Decorator: authenticate
  // Usage: preHandler: [fastify.authenticate]
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
      const authHeader = request.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError(
          'Access token is required. Include it in the Authorization header as: Bearer <token>',
          'AUTH_001'
        )
      }

      const token = authHeader.slice(7)

      let payload: JwtPayload
      try {
        payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          throw new AuthenticationError(
            'Access token has expired. Please refresh your token.',
            'AUTH_002'
          )
        }
        throw new AuthenticationError(
          'Invalid access token.',
          'AUTH_003'
        )
      }

      // Reject setup tokens — they have purpose='setup' and no userId
      const rawPayload = payload as JwtPayload & { purpose?: string; phone?: string }
      if (rawPayload.purpose === 'setup' || !rawPayload.userId) {
        throw new AuthenticationError(
          'Invalid access token. Setup tokens cannot be used for authentication.',
          'AUTH_003'
        )
      }

      // Check token blacklist (for logged-out tokens)
      const isBlacklisted = await redis.exists(
        RedisKeys.tokenBlacklist(payload.sessionId)
      )
      if (isBlacklisted) {
        throw new AuthenticationError(
          'Token has been revoked. Please log in again.',
          'AUTH_003'
        )
      }

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, status: true, role: true },
      })

      if (!user) {
        throw new AuthenticationError('User account not found.', 'AUTH_003')
      }

      if (user.status === 'SUSPENDED') {
        throw new AuthenticationError(
          'Your account has been suspended. Please contact support.',
          'AUTH_005'
        )
      }

      if (user.status === 'INACTIVE') {
        throw new AuthenticationError(
          'Your account is inactive.',
          'AUTH_006'
        )
      }

      // Attach user to request for use in route handlers
      request.user = payload
    }
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Decorator: authorize (role-based access)
  // Usage: preHandler: [fastify.authenticate, fastify.authorize(['ADMIN'])]
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  fastify.decorate(
    'authorize',
    (allowedRoles: UserRole[]) =>
      async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
        if (!request.user) {
          throw new AuthenticationError()
        }

        if (!allowedRoles.includes(request.user.role)) {
          throw new AuthorizationError()
        }
      }
  )
}

// Extend FastifyInstance with our decorators
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    authorize: (
      roles: UserRole[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export default fp(authPlugin, {
  name: 'auth-plugin',
})