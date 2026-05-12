import type { FastifyInstance } from 'fastify'
import * as authController from './auth.controller.js'

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const prefix = '/auth'

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC ROUTES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  fastify.post(`${prefix}/send-otp`, {
    config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
  }, authController.sendOtp)

  fastify.post(`${prefix}/verify-otp`, {
    config: { rateLimit: { max: 10, timeWindow: '10 minutes' } },
  }, authController.verifyOtp)

  fastify.post(`${prefix}/register`, {
    config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
  }, authController.register)

  fastify.post(`${prefix}/google`, {
    config: { rateLimit: { max: 10, timeWindow: '10 minutes' } },
  }, authController.googleAuth)

  // ← ADD THIS
  fastify.post(`${prefix}/apple`, {
    config: { rateLimit: { max: 10, timeWindow: '10 minutes' } },
  }, authController.appleAuth)

  fastify.post(`${prefix}/refresh`, {
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
  }, authController.refreshToken)

  fastify.post(`${prefix}/restaurant/login`, {
    config: { rateLimit: { max: 10, timeWindow: '10 minutes' } },
  }, authController.restaurantLogin)

  fastify.post(`${prefix}/restaurant/register`, {
    config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
  }, authController.restaurantRegister)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROTECTED ROUTES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  fastify.post(`${prefix}/logout`, {
    preHandler: [fastify.authenticate],
  }, authController.logout)

  fastify.get(`${prefix}/me`, {
    preHandler: [fastify.authenticate],
  }, authController.getMe)
}