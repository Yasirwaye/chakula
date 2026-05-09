import { buildApp } from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { connectRedis, disconnectRedis } from './config/redis.js'
import { env } from './config/env.js'
import { logger } from './config/logger.js'

async function start(): Promise<void> {
  let app: Awaited<ReturnType<typeof buildApp>> | null = null

  try {
    logger.info('🚀 Starting Chakula API server...')

    // Connect to services first
    await connectDatabase()
    await connectRedis()

    // Build the Fastify app
    app = await buildApp()

    // Start listening
    await app.listen({
      port: env.PORT,
      host: '0.0.0.0', // Required for Render deployment
    })

    logger.info(`
╔═══════════════════════════════════════════╗
║         CHAKULA API SERVER RUNNING        ║
╠═══════════════════════════════════════════╣
║  Environment:  ${env.NODE_ENV.padEnd(26)}║
║  Port:         ${String(env.PORT).padEnd(26)}║
║  API:          http://localhost:${env.PORT}/${env.API_VERSION}  ║
║  Health:       http://localhost:${env.PORT}/health  ║
${env.IS_DEVELOPMENT ? `║  Docs:         http://localhost:${env.PORT}/docs    ║\n` : ''}╚═══════════════════════════════════════════╝
    `)
  } catch (error) {
    logger.error({ error }, '❌ Failed to start server')
    process.exit(1)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Graceful shutdown handlers
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully...`)

    try {
      if (app) {
        await app.close()
        logger.info('✅ HTTP server closed')
      }

      await disconnectDatabase()
      await disconnectRedis()

      logger.info('✅ All connections closed. Goodbye!')
      process.exit(0)
    } catch (error) {
      logger.error({ error }, '❌ Error during shutdown')
      process.exit(1)
    }
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  // Handle uncaught errors — log them, don't crash silently
  process.on('uncaughtException', (error) => {
    logger.error({ error: error.message, stack: error.stack }, '🔴 Uncaught exception')
    process.exit(1)
  })

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, '🔴 Unhandled promise rejection')
    process.exit(1)
  })
}

start()