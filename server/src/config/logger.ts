import pino from 'pino'
import { env } from './env.js'

export const logger = pino({
  level: env.IS_PRODUCTION ? 'info' : 'debug',

  // Pretty print in development
  transport: env.IS_DEVELOPMENT
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
          messageFormat: '{msg}',
        },
      }
    : undefined,

  // Production: structured JSON
  formatters: {
    level: (label) => ({ level: label }),
    bindings: () => ({
      service: 'chakula-api',
      version: '1.0.0',
      environment: env.NODE_ENV,
    }),
  },

  // Redact sensitive fields — NEVER log these
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.otp',
      'req.body.pin',
      'req.body.cardNumber',
      'req.body.cvv',
      '*.password',
      '*.passwordHash',
      '*.otp',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
      '*.mpesaPin',
    ],
    censor: '[REDACTED]',
  },

  timestamp: pino.stdTimeFunctions.isoTime,
})

export type Logger = typeof logger