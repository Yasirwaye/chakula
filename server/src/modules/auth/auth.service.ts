import { createPublicKey } from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/database.js'
import { env } from '../../config/env.js'
import { logger } from '../../config/logger.js'
import {
  generateOTP,
  storeOTP,
  verifyOTP,
  checkOTPRateLimit,
  getOTPExpiryInfo,
} from '../../utils/otp.js'
import { sendOTPSms } from '../../utils/sms.js'
import {
  buildAuthTokens,
  generateSetupToken,
  verifySetupToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  verifyAndRotateRefreshToken,
  generateAccessToken,
  storeRefreshToken,
  generateRefreshToken,
} from '../../utils/tokens.js'
import {
  AuthenticationError,
  ConflictError,
  RateLimitError,
} from '../../utils/errors.js'
import type {
  SendOtpInput,
  VerifyOtpInput,
  RegisterInput,
  GoogleAuthInput,
  AppleAuthInput,        
} from '@chakula/shared-schemas'
import type { UserRole } from '@chakula/shared-types'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAFE USER SELECT — never expose sensitive fields
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SAFE_USER_SELECT = {
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
  pushToken: true,
  pushEnabled: true,
  preferredLanguage: true,
  preferredCurrency: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEND OTP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function sendOtp(input: SendOtpInput, _ipAddress: string) {
  const { phone } = input

  const rateCheck = await checkOTPRateLimit(phone)
  if (!rateCheck.allowed) {
    throw new RateLimitError(
      `Too many OTP requests. Try again in ${Math.ceil((rateCheck.retryAfter ?? 0) / 60)} minutes.`,
      rateCheck.retryAfter ?? 600
    )
  }

  const otp = generateOTP(6)
  await storeOTP(phone, otp)

  const smsSent = await sendOTPSms(phone, otp)

  if (!smsSent || env.NODE_ENV === 'development') {
    logger.info({ otp, phone: phone.slice(0, 5) + '***' }, '🔑 DEV: OTP Code')
  }

  const { expiresInSeconds, canResendAt } = getOTPExpiryInfo()
  const maskedPhone = phone.slice(0, 5) + '***' + phone.slice(-3)

  return {
    phone,
    maskedPhone,
    expiresIn: expiresInSeconds,
    canResendAt,
    smsSent,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VERIFY OTP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function verifyOtp(
  input: VerifyOtpInput,
  ipAddress: string,
  userAgent?: string
) {
  const { phone, otp, deviceId, deviceName, deviceOS, pushToken } = input

  const result = await verifyOTP(phone, otp)
  if (!result.valid) {
    throw new AuthenticationError(result.reason ?? 'Invalid OTP', 'AUTH_003')
  }

  const existingUser = await prisma.user.findUnique({
    where: { phone },
    select: SAFE_USER_SELECT,
  })

  if (!existingUser) {
    const setupToken = generateSetupToken(phone)
    return { isNewUser: true, setupToken, phone }
  }

  if (existingUser.status === 'SUSPENDED') {
    throw new AuthenticationError(
      'Your account has been suspended. Please contact support.',
      'AUTH_005'
    )
  }

  const updatedUser = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      isPhoneVerified: true,
      lastLoginAt: new Date(),
      ...(pushToken ? { pushToken } : {}),
    },
    select: SAFE_USER_SELECT,
  })

  const tokens = await buildAuthTokens(updatedUser, {
    deviceId,
    deviceName,
    deviceOS,
    ipAddress,
    userAgent,
  })

  logger.info(
    { userId: updatedUser.id, role: updatedUser.role },
    'User logged in via OTP'
  )

  return { isNewUser: false, ...tokens, user: updatedUser }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REGISTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function register(
  input: RegisterInput,
  setupToken: string,
  ipAddress: string,
  userAgent?: string
) {
  const tokenData = verifySetupToken(setupToken)
  if (!tokenData) {
    throw new AuthenticationError(
      'Invalid or expired setup token. Please verify your phone again.',
      'AUTH_003'
    )
  }

  const { name, email, deviceId, deviceName, deviceOS, pushToken } = input
  const { phone } = tokenData

  if (email) {
    const emailExists = await prisma.user.findUnique({ where: { email } })
    if (emailExists) {
      throw new ConflictError('This email address is already registered.')
    }
  }

  const phoneExists = await prisma.user.findUnique({
    where: { phone },
    select: SAFE_USER_SELECT,
  })

  if (phoneExists) {
    const tokens = await buildAuthTokens(phoneExists, {
      deviceId,
      deviceName,
      deviceOS,
      ipAddress,
      userAgent,
    })
    return { ...tokens, user: phoneExists }
  }

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email?.toLowerCase().trim(),
      phone,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      authProvider: 'PHONE',
      isPhoneVerified: true,
      isEmailVerified: false,
      pushToken: pushToken ?? null,
      lastLoginAt: new Date(),
    },
    select: SAFE_USER_SELECT,
  })

  const tokens = await buildAuthTokens(user, {
    deviceId,
    deviceName,
    deviceOS,
    ipAddress,
    userAgent,
  })

  logger.info(
    { userId: user.id, phone: phone.slice(0, 5) + '***' },
    'New customer registered'
  )

  return { ...tokens, user }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GOOGLE AUTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function googleAuth(
  input: GoogleAuthInput,
  ipAddress: string,
  userAgent?: string
) {
  const { idToken, deviceId, pushToken } = input

  const googleUser = await verifyGoogleToken(idToken)
  if (!googleUser) {
    throw new AuthenticationError('Invalid Google token', 'AUTH_003')
  }

  const { sub: googleId, email, name, picture } = googleUser

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { googleId },
        ...(email ? [{ email }] : []),
      ],
    },
    select: SAFE_USER_SELECT,
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: name ?? 'Chakula User',
        email: email ?? null,
        phone: `google_${googleId}`,
        googleId,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        authProvider: 'GOOGLE',
        isEmailVerified: true,
        isPhoneVerified: false,
        avatar: picture ?? null,
        pushToken: pushToken ?? null,
        lastLoginAt: new Date(),
      },
      select: SAFE_USER_SELECT,
    })
    logger.info({ userId: user.id }, 'New user registered via Google')
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        ...(pushToken ? { pushToken } : {}),
      },
      select: SAFE_USER_SELECT,
    })
    logger.info({ userId: user.id }, 'User logged in via Google')
  }

  if (user.status === 'SUSPENDED') {
    throw new AuthenticationError('Your account has been suspended.', 'AUTH_005')
  }

  const isNewUser = user.createdAt === user.lastLoginAt
  const tokens = await buildAuthTokens(user, { deviceId, ipAddress, userAgent })

  return { isNewUser, ...tokens, user }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// APPLE SIGN-IN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function appleAuth(
  input: {
    identityToken: string
    authorizationCode: string
    fullName?: { givenName?: string | null; familyName?: string | null } | null
    email?: string
    deviceId?: string
    pushToken?: string
  },
  ipAddress: string,
  userAgent?: string
) {
  const { identityToken, fullName, email, deviceId, pushToken } = input

  // Verify Apple identity token
  const appleUser = await verifyAppleToken(identityToken)
  if (!appleUser) {
    throw new AuthenticationError('Invalid Apple token', 'AUTH_003')
  }

  const { sub: appleId } = appleUser

  // Build name from fullName (only available on first sign-in)
  const firstName = fullName?.givenName ?? ''
  const lastName = fullName?.familyName ?? ''
  const fullNameStr = [firstName, lastName].filter(Boolean).join(' ').trim()

  // Find existing user by appleId or email
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { appleId },
        ...(email && !email.includes('privaterelay') ? [{ email }] : []),
      ],
    },
    select: SAFE_USER_SELECT,
  })

  if (!user) {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // NEW USER via Apple
    // IMPORTANT: Store name NOW — Apple won't send it again
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    user = await prisma.user.create({
      data: {
        name: fullNameStr || 'Chakula User',  // Use name from Apple or default
        email: email ?? null,
        phone: `apple_${appleId}`,            // Placeholder phone
        appleId,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        authProvider: 'APPLE',
        isEmailVerified: email ? true : false,
        isPhoneVerified: false,
        pushToken: pushToken ?? null,
        lastLoginAt: new Date(),
      },
      select: SAFE_USER_SELECT,
    })
    logger.info({ userId: user.id }, 'New user registered via Apple')
  } else {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // EXISTING USER — update appleId + login time
    // Don't overwrite name (Apple won't send it again)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        appleId,
        lastLoginAt: new Date(),
        ...(pushToken ? { pushToken } : {}),
        // Only update name if it's currently a placeholder AND Apple sent one
        ...(user.name === 'Chakula User' && fullNameStr ? { name: fullNameStr } : {}),
      },
      select: SAFE_USER_SELECT,
    })
    logger.info({ userId: user.id }, 'User logged in via Apple')
  }

  if (user.status === 'SUSPENDED') {
    throw new AuthenticationError('Your account has been suspended.', 'AUTH_005')
  }

  const isNewUser = user.createdAt === user.lastLoginAt
  const tokens = await buildAuthTokens(user, { deviceId, ipAddress, userAgent })

  return { isNewUser, ...tokens, user }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REFRESH TOKEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function refreshToken(token: string) {
  const userData = await verifyAndRotateRefreshToken(token)

  if (!userData) {
    throw new AuthenticationError(
      'Invalid or expired refresh token. Please log in again.',
      'AUTH_002'
    )
  }

  const newRefreshToken = generateRefreshToken()
  const newSessionId = await storeRefreshToken({
    userId: userData.userId,
    refreshToken: newRefreshToken,
  })

  const accessToken = generateAccessToken({
    userId: userData.userId,
    role: userData.role,
    sessionId: newSessionId,
  })

  return { accessToken, refreshToken: newRefreshToken, expiresIn: 900 }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGOUT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function logout(
  refreshTokenValue: string,
  userId: string,
  logoutAll: boolean
) {
  if (logoutAll) {
    await revokeAllUserTokens(userId)
    logger.info({ userId }, 'User logged out from all devices')
  } else {
    await revokeRefreshToken(refreshTokenValue)
    logger.info({ userId }, 'User logged out from current device')
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESTAURANT LOGIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function restaurantLogin(
  email: string,
  password: string,
  ipAddress: string,
  userAgent?: string
) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      ...SAFE_USER_SELECT,
      passwordHash: true, // Need this for comparison only
    },
  })

  if (!user || !user.passwordHash) {
    throw new AuthenticationError('Invalid email or password', 'AUTH_003')
  }

  if (user.role !== 'RESTAURANT' && user.role !== 'ADMIN') {
    throw new AuthenticationError('Invalid email or password', 'AUTH_003')
  }

  if (user.status === 'SUSPENDED') {
    throw new AuthenticationError(
      'Your account has been suspended. Contact support.',
      'AUTH_005'
    )
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash)
  if (!passwordValid) {
    throw new AuthenticationError('Invalid email or password', 'AUTH_003')
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  const tokens = await buildAuthTokens(user, { ipAddress, userAgent })

  logger.info({ userId: user.id, role: user.role }, 'Restaurant/Admin login')

  // Strip passwordHash before returning
  const { passwordHash: _, ...safeUser } = user

  return { ...tokens, user: safeUser }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESTAURANT REGISTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function restaurantRegister(
  name: string,
  email: string,
  password: string,
  phone: string,
  ipAddress: string,
  userAgent?: string
) {
  const emailExists = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  if (emailExists) {
    throw new ConflictError('This email is already registered.')
  }

  const phoneExists = await prisma.user.findUnique({ where: { phone } })
  if (phoneExists) {
    throw new ConflictError('This phone number is already registered.')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      passwordHash,
      role: 'RESTAURANT',
      status: 'ACTIVE',
      authProvider: 'PHONE',
      isEmailVerified: false,
      isPhoneVerified: false,
      lastLoginAt: new Date(),
    },
    select: SAFE_USER_SELECT, // Never select passwordHash
  })

  const tokens = await buildAuthTokens(user, { ipAddress, userAgent })

  logger.info({ userId: user.id }, 'New restaurant owner registered')

  return { ...tokens, user }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GOOGLE TOKEN VERIFICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function verifyGoogleToken(idToken: string): Promise<{
  sub: string
  email?: string
  name?: string
  picture?: string
} | null> {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    )

    if (!response.ok) return null

    const data = await response.json() as {
      aud: string
      sub: string
      email?: string
      name?: string
      picture?: string
    }

    if (data.aud !== env.GOOGLE_CLIENT_ID) {
      logger.warn('Google token audience mismatch')
      return null
    }

    return { sub: data.sub, email: data.email, name: data.name, picture: data.picture }
  } catch (error) {
    logger.error({ error }, 'Google token verification failed')
    return null
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// APPLE TOKEN VERIFICATION
// Verifies Apple identityToken using Apple's public JWKS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function verifyAppleToken(identityToken: string): Promise<{
  sub: string          // Apple user ID — permanent unique identifier
  email?: string
  emailVerified?: boolean
} | null> {
  try {
    // Decode header to get the key ID (kid)
    const decodedHeader = jwt.decode(identityToken, { complete: true })
    if (!decodedHeader || typeof decodedHeader === 'string') {
      logger.warn('Could not decode Apple token header')
      return null
    }

    const kid = decodedHeader.header.kid
    if (!kid) {
      logger.warn('Apple token missing kid in header')
      return null
    }

    // Fetch Apple's public keys
    const appleKeysResponse = await fetch('https://appleid.apple.com/auth/keys')
    if (!appleKeysResponse.ok) {
      logger.error('Failed to fetch Apple public keys')
      return null
    }

    const appleKeys = await appleKeysResponse.json() as {
      keys: Array<{
        kid: string
        kty: string
        use: string
        alg: string
        n: string
        e: string
      }>
    }

    // Find the matching key
    const matchingKey = appleKeys.keys.find((key) => key.kid === kid)
    if (!matchingKey) {
      logger.warn({ kid }, 'No matching Apple public key found')
      return null
    }

    // Convert JWK to PEM format for jwt.verify
    const publicKey = buildApplePublicKey(matchingKey)
    if (!publicKey) return null

    // Verify the token
    const payload = jwt.verify(identityToken, publicKey, {
      algorithms: ['RS256'],
      issuer: 'https://appleid.apple.com',
      audience: env.APPLE_CLIENT_ID || 'com.chakula.app',
    }) as {
      sub: string
      email?: string
      email_verified?: string | boolean
      aud: string
      iss: string
    }

    return {
      sub: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified === true || payload.email_verified === 'true',
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown' },
      'Apple token verification failed'
    )
    return null
  }
}

function buildApplePublicKey(jwk: {
  kty: string
  n: string
  e: string
  alg?: string
  kid?: string
  use?: string
}): string | null {
  try {
    // Convert JWK to PEM format
    const key = createPublicKey({
      key: {
        kty: jwk.kty,
        n: jwk.n,
        e: jwk.e,
        alg: jwk.alg,
        kid: jwk.kid,
        use: jwk.use || 'sig'
      },
      format: 'jwk'
    } as any) // Type assertion for JWK compatibility
    
    return key.export({ type: 'spki', format: 'pem' }) as string
  } catch (error) {
    logger.error({ error }, 'Failed to build Apple public key')
    return null
  }
}