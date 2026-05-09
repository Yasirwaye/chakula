import type { FastifyReply, FastifyRequest } from 'fastify'
// import { maskPhone, maskEmail } from '@chakula/shared-utils'

export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Log incoming request
  request.log.info(
    {
      requestId: request.id,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    },
    `→ ${request.method} ${request.url}`
  )
}

export async function responseLogger(
  request: FastifyRequest,
  reply: FastifyReply,
  payload: unknown
): Promise<unknown> {
  request.log.info(
    {
      requestId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTimeMs: Math.round(reply.elapsedTime),
    },
    `← ${request.method} ${request.url} ${reply.statusCode} (${Math.round(reply.elapsedTime)}ms)`
  )
  return payload
}