import dotenv from 'dotenv'
import path from 'path'

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') })

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Validate and export all environment variables
// App will CRASH on startup if required vars missing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`)
  }
  return value
}

function optionalEnv(key: string, defaultValue = ''): string {
  return process.env[key] ?? defaultValue
}

function requireEnvNumber(key: string): number {
  const value = requireEnv(key)
  const num = Number(value)
  if (isNaN(num)) {
    throw new Error(`❌ Environment variable ${key} must be a number, got: ${value}`)
  }
  return num
}

export const env = {
  // Server
  NODE_ENV: optionalEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  PORT: Number(optionalEnv('PORT', '3000')),
  API_VERSION: optionalEnv('API_VERSION', 'v1'),
  FRONTEND_URL: optionalEnv('FRONTEND_URL', 'http://localhost:8081'),
  RESTAURANT_DASHBOARD_URL: optionalEnv('RESTAURANT_DASHBOARD_URL', 'http://localhost:3001'),
  ADMIN_PANEL_URL: optionalEnv('ADMIN_PANEL_URL', 'http://localhost:3002'),

  // Database
  DATABASE_URL: requireEnv('DATABASE_URL'),

  // Redis
  REDIS_URL: requireEnv('REDIS_URL'),
  REDIS_PASSWORD: optionalEnv('REDIS_PASSWORD'),

  // JWT
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '15m'),
  REFRESH_TOKEN_SECRET: requireEnv('REFRESH_TOKEN_SECRET'),
  REFRESH_TOKEN_EXPIRES_IN: optionalEnv('REFRESH_TOKEN_EXPIRES_IN', '30d'),

  // OTP
  OTP_EXPIRY_MINUTES: Number(optionalEnv('OTP_EXPIRY_MINUTES', '5')),
  OTP_LENGTH: Number(optionalEnv('OTP_LENGTH', '6')),

  // Africa's Talking
  AT_API_KEY: optionalEnv('AT_API_KEY', 'sandbox'),
  AT_USERNAME: optionalEnv('AT_USERNAME', 'sandbox'),
  AT_SENDER_ID: optionalEnv('AT_SENDER_ID', 'CHAKULA'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: optionalEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: optionalEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: optionalEnv('CLOUDINARY_API_SECRET'),

  // Google
  GOOGLE_CLIENT_ID: optionalEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_MAPS_API_KEY: optionalEnv('GOOGLE_MAPS_API_KEY'),

  // M-Pesa
  MPESA_CONSUMER_KEY: optionalEnv('MPESA_CONSUMER_KEY'),
  MPESA_CONSUMER_SECRET: optionalEnv('MPESA_CONSUMER_SECRET'),
  MPESA_SHORTCODE: optionalEnv('MPESA_SHORTCODE', '174379'),
  MPESA_PASSKEY: optionalEnv('MPESA_PASSKEY'),
  MPESA_CALLBACK_URL: optionalEnv('MPESA_CALLBACK_URL'),
  MPESA_ENVIRONMENT: optionalEnv('MPESA_ENVIRONMENT', 'sandbox') as 'sandbox' | 'production',

  // Flutterwave
  FLUTTERWAVE_PUBLIC_KEY: optionalEnv('FLUTTERWAVE_PUBLIC_KEY'),
  FLUTTERWAVE_SECRET_KEY: optionalEnv('FLUTTERWAVE_SECRET_KEY'),
  FLUTTERWAVE_ENCRYPTION_KEY: optionalEnv('FLUTTERWAVE_ENCRYPTION_KEY'),
  FLUTTERWAVE_WEBHOOK_SECRET: optionalEnv('FLUTTERWAVE_WEBHOOK_SECRET'),

  // Email
  RESEND_API_KEY: optionalEnv('RESEND_API_KEY'),
  EMAIL_FROM: optionalEnv('EMAIL_FROM', 'no-reply@chakula.com'),
  EMAIL_FROM_NAME: optionalEnv('EMAIL_FROM_NAME', 'Chakula'),

  // Sentry
  SENTRY_DSN: optionalEnv('SENTRY_DSN'),

  // Business Config
  DEFAULT_COMMISSION_PERCENTAGE: Number(optionalEnv('DEFAULT_COMMISSION_PERCENTAGE', '18')),
  SERVICE_FEE_FIXED: Number(optionalEnv('SERVICE_FEE_FIXED', '50')),
  BASE_DELIVERY_FEE: Number(optionalEnv('BASE_DELIVERY_FEE', '80')),
  DELIVERY_FEE_PER_KM: Number(optionalEnv('DELIVERY_FEE_PER_KM', '20')),
  ORDER_TIMEOUT_MINUTES: Number(optionalEnv('ORDER_TIMEOUT_MINUTES', '2')),
  MAX_DELIVERY_RADIUS_KM: Number(optionalEnv('MAX_DELIVERY_RADIUS_KM', '15')),
  CURRENCY: optionalEnv('CURRENCY', 'KES'),
  COUNTRY_CODE: optionalEnv('COUNTRY_CODE', 'KE'),
  RIDER_BASE_EARNING: Number(optionalEnv('RIDER_BASE_EARNING', '80')),
  RIDER_EARNING_PER_KM: Number(optionalEnv('RIDER_EARNING_PER_KM', '25')),

  // Helpers
  get IS_PRODUCTION() { return this.NODE_ENV === 'production' },
  get IS_DEVELOPMENT() { return this.NODE_ENV === 'development' },
  get IS_TEST() { return this.NODE_ENV === 'test' },
}