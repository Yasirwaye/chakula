import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { redis } from './config/redis.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger, responseLogger } from './middleware/requestLogger.js'
import authPlugin from './plugins/auth.plugin.js'

export async function buildApp() {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Create Fastify instance
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const app = Fastify({
    logger: false, // We use our own Pino logger
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    genReqId: () => crypto.randomUUID(),
    trustProxy: true, // We're behind Cloudflare/Render proxy
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECURITY PLUGINS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // CORS — only allow our frontends
  await app.register(cors, {
    origin: (origin, callback) => {
      const allowedOrigins = [
        env.FRONTEND_URL,
        env.RESTAURANT_DASHBOARD_URL,
        env.ADMIN_PANEL_URL,
        // Allow mobile apps (no origin header)
        'capacitor://localhost',
        'ionic://localhost',
      ]

      // Allow requests with no origin (mobile apps, Postman in dev)
      if (!origin) {
        if (env.IS_PRODUCTION) {
          // In production, mobile apps have no origin — allow it
          callback(null, true)
        } else {
          callback(null, true) // Allow in dev too
        }
        return
      }

      if (allowedOrigins.includes(origin) || env.IS_DEVELOPMENT) {
        callback(null, true)
      } else {
        logger.warn({ origin }, 'CORS blocked request from unauthorized origin')
        callback(new Error('Not allowed by CORS'), false)
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    maxAge: 86400,
  })

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: env.IS_PRODUCTION,
    crossOriginEmbedderPolicy: false,
  })

  // Rate limiting — global default
  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    redis: redis,
    keyGenerator: (request) => {
      // Rate limit by user ID if authenticated, otherwise by IP
      return request.headers.authorization
        ? `user:${request.headers.authorization.slice(-8)}` // Last 8 chars of token
        : request.ip
    },
    errorResponseBuilder: (_request, context) => ({
      success: false,
      message: `Too many requests. Please try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
      error: {
        code: 'RATE_LIMIT_001',
        retryAfter: Math.ceil(context.ttl / 1000),
      },
    }),
  })

  // File upload support
  await app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max
      files: 5, // Max 5 files per request
    },
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // API DOCUMENTATION (Swagger)
  // Only available in non-production environments
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (!env.IS_PRODUCTION) {
    await app.register(swagger, {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'Chakula API',
          description: 'Food delivery platform API',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${env.PORT}`,
            description: 'Development server',
          },
        ],
        tags: [
          { name: 'Auth', description: 'Authentication endpoints' },
          { name: 'Users', description: 'User profile management' },
          { name: 'Restaurants', description: 'Restaurant discovery' },
          { name: 'Orders', description: 'Order management' },
          { name: 'Payments', description: 'Payment processing' },
          { name: 'Riders', description: 'Rider management' },
          { name: 'Admin', description: 'Admin panel' },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    })

    await app.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    })
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CUSTOM PLUGINS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  await app.register(authPlugin)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REQUEST / RESPONSE HOOKS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.addHook('onRequest', requestLogger)
  app.addHook('onSend', responseLogger)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GLOBAL ERROR HANDLER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.setErrorHandler(errorHandler)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 404 HANDLER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      message: `Route ${request.method} ${request.url} not found`,
      error: { code: 'NOT_FOUND_001' },
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HEALTH CHECK ROUTE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.get('/health', {
    config: { rateLimit: { max: 300, timeWindow: '1 minute' } },
  }, async (_request, reply) => {
    // Check all service connections
    const services = {
      database: 'ok' as 'ok' | 'error',
      redis: 'ok' as 'ok' | 'error',
    }

    // Check database
    try {
      const { prisma } = await import('./config/database.js')
      await prisma.$queryRaw`SELECT 1`
    } catch {
      services.database = 'error'
    }

    // Check Redis
    try {
      await redis.ping()
    } catch {
      services.redis = 'error'
    }

    const allHealthy = Object.values(services).every((s) => s === 'ok')
    const statusCode = allHealthy ? 200 : 503

    return reply.status(statusCode).send({
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: env.NODE_ENV,
      services,
      uptime: Math.floor(process.uptime()),
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC APP CONFIG ROUTE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.get(`/${env.API_VERSION}/config/public`, async (_request, reply) => {
    return reply.send({
      success: true,
      data: {
        maintenanceMode: false,
        maintenanceMessage: null,
        minAppVersionIos: '1.0.0',
        minAppVersionAndroid: '1.0.0',
        serviceFee: env.SERVICE_FEE_FIXED,
        baseDeliveryFee: env.BASE_DELIVERY_FEE,
        deliveryFeePerKm: env.DELIVERY_FEE_PER_KM,
        supportPhone: '+254700000001',
        supportEmail: 'support@chakula.com',
        currency: env.CURRENCY,
        defaultRadiusKm: 5,
      },
    })
  })

  return app
}