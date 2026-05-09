import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { logger } from '../config/logger.js'
import {
  AppError,
  ValidationError,
  isAppError,
} from '../utils/errors.js'
import { env } from '../config/env.js'

export function errorHandler(
  error: FastifyError | Error | AppError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  const requestId = request.id

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HANDLE ZOD VALIDATION ERRORS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (error instanceof ZodError) {
    const details = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))

    logger.warn(
      { requestId, validationErrors: details },
      'Validation error'
    )

    reply.status(400).send({
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details,
      },
    })
    return
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HANDLE OUR CUSTOM APP ERRORS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isAppError(error)) {
    // Log based on severity
    if (error.statusCode >= 500) {
      logger.error(
        { requestId, errorCode: error.code, stack: error.stack },
        error.message
      )
    } else if (error.statusCode >= 400) {
      logger.warn(
        { requestId, errorCode: error.code },
        error.message
      )
    }

    const response: Record<string, unknown> = {
      success: false,
      message: error.message,
      error: {
        code: error.code,
      },
    }

    // Include validation details if present
    if (error instanceof ValidationError && error.details.length > 0) {
      (response.error as Record<string, unknown>).details = error.details
    }

    reply.status(error.statusCode).send(response)
    return
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HANDLE FASTIFY BUILT-IN ERRORS (e.g., 404 route not found)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const fastifyError = error as FastifyError
  if (fastifyError.statusCode) {
    logger.warn(
      { requestId, statusCode: fastifyError.statusCode },
      fastifyError.message
    )

    reply.status(fastifyError.statusCode).send({
      success: false,
      message: fastifyError.message,
      error: {
        code: `HTTP_${fastifyError.statusCode}`,
      },
    })
    return
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HANDLE UNKNOWN ERRORS (bugs — should never happen)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  logger.error(
    {
      requestId,
      error: error.message,
      stack: error.stack,
    },
    '🔴 Unhandled error — this is a bug!'
  )

  // Never expose internal errors in production
  reply.status(500).send({
    success: false,
    message: env.IS_PRODUCTION
      ? 'An unexpected error occurred. Please try again.'
      : error.message,
    error: {
      code: 'SERVER_001',
    },
  })
}