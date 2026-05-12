import type { FastifyRequest, FastifyReply } from 'fastify'
import * as authService from './auth.service.js'
import {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  googleAuthSchema,
  appleAuthSchema,
  refreshTokenSchema,
  logoutSchema,
  restaurantLoginSchema,
  restaurantRegisterSchema,
} from '@chakula/shared-schemas'
import { ValidationError, AuthenticationError } from '../../utils/errors.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/auth/send-otp
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function sendOtp(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const body = sendOtpSchema.parse(request.body)
  const result = await authService.sendOtp(body, request.ip)

  reply.status(200).send({
    success: true,
    message: 'OTP sent successfully',
    data: result,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/auth/verify-otp
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function verifyOtp(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const body = verifyOtpSchema.parse(request.body)
  const result = await authService.verifyOtp(
    body,
    request.ip,
    request.headers['user-agent']
  )

  const isNewUser = 'setupToken' in result

  // Strip internal sessionId — not needed by client
  const { sessionId: _s, ...safeResult } = result as typeof result & { sessionId?: string }

  reply.status(200).send({
    success: true,
    message: isNewUser
      ? 'Phone verified. Please complete your profile.'
      : 'Login successful',
    data: safeResult,    // ← changed from result to safeResult
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/auth/register
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function register(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Setup token required', 'AUTH_001')
  }
  const setupToken = authHeader.slice(7)

  const body = registerSchema.parse(request.body)
  const result = await authService.register(
    body,
    setupToken,
    request.ip,
    request.headers['user-agent']
  )

  // Strip internal sessionId — not needed by client
  const { sessionId: _s, ...safeResult } = result as typeof result & { sessionId?: string }

  reply.status(201).send({
    success: true,
    message: 'Account created successfully',
    data: safeResult,    // ← changed from result to safeResult
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/auth/google
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function googleAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const body = googleAuthSchema.parse(request.body)
  const result = await authService.googleAuth(
    body,
    request.ip,
    request.headers['user-agent']
  )

  reply.status(200).send({
    success: true,
    message: 'Google sign-in successful',
    data: result,
  })
}

/// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/auth/apple
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function appleAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Use the statically imported schema — NOT dynamic import
  const body = appleAuthSchema.parse(request.body)

  const result = await authService.appleAuth(
    body,
    request.ip,
    request.headers['user-agent']
  )

  reply.status(200).send({
    success: true,
    message: 'Apple sign-in successful',
    data: result,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/auth/refresh
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function refreshToken(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const { refreshToken } = refreshTokenSchema.parse(request.body)
  const result = await authService.refreshToken(refreshToken)

  reply.status(200).send({
    success: true,
    message: 'Token refreshed',
    data: result,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/auth/logout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function logout(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const { refreshToken, logoutAll } = logoutSchema.parse(request.body)

  await authService.logout(refreshToken, request.user.userId, logoutAll)

  reply.status(200).send({
    success: true,
    message: logoutAll ? 'Logged out from all devices' : 'Logged out successfully',
    data: null,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/auth/me
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getMe(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const { prisma } = await import('../../config/database.js')

  const user = await prisma.user.findUnique({
    where: { id: request.user.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      status: true,
      authProvider: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      pushEnabled: true,
      preferredLanguage: true,
      preferredCurrency: true,
      lastLoginAt: true,
      createdAt: true,
    },
  })

  if (!user) {
    throw new AuthenticationError('User not found', 'AUTH_003')
  }

  reply.status(200).send({
    success: true,
    data: user,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/auth/restaurant/login
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function restaurantLogin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const { email, password } = restaurantLoginSchema.parse(request.body)
  const result = await authService.restaurantLogin(
    email,
    password,
    request.ip,
    request.headers['user-agent']
  )

  reply.status(200).send({
    success: true,
    message: 'Login successful',
    data: result,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/auth/restaurant/register
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function restaurantRegister(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const { name, email, password, phone } = restaurantRegisterSchema.parse(request.body)
  const result = await authService.restaurantRegister(
    name,
    email,
    password,
    phone,
    request.ip,
    request.headers['user-agent']
  )

  reply.status(201).send({
    success: true,
    message: 'Restaurant account created. Complete your restaurant profile to go live.',
    data: result,
  })
}