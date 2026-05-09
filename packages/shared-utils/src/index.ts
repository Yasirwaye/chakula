import type { OperatingHours } from '@chakula/shared-types'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CURRENCY FORMATTING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const formatCurrency = (
  amount: number,
  currency = 'KES',
  locale = 'en-KE'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatAmount = (amount: number): string => {
  return `KES ${amount.toLocaleString('en-KE')}`
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHONE FORMATTING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const normalizePhone = (phone: string): string => {
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '')
  if (cleaned.startsWith('0')) {
    return '+254' + cleaned.slice(1)
  }
  if (cleaned.startsWith('254') && !cleaned.startsWith('+')) {
    return '+' + cleaned
  }
  return cleaned
}

export const maskPhone = (phone: string): string => {
  if (phone.length < 8) return phone
  const start = phone.slice(0, 5)
  const end = phone.slice(-3)
  const masked = '*'.repeat(phone.length - 8)
  return `${start}${masked}${end}`
}

export const maskEmail = (email: string): string => {
  const [user, domain] = email.split('@')
  if (!user || !domain) return email
  const maskedUser =
    user.length <= 2
      ? user
      : user[0] + '*'.repeat(user.length - 2) + user[user.length - 1]
  return `${maskedUser}@${domain}`
}

// Format phone for Daraja (M-Pesa) — removes + prefix
export const formatPhoneForDaraja = (phone: string): string => {
  const normalized = normalizePhone(phone)
  return normalized.replace('+', '')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DISTANCE CALCULATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const calculateDistanceKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // Round to 1 decimal
}

const toRad = (value: number): number => (value * Math.PI) / 180

export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELIVERY FEE CALCULATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const calculateDeliveryFee = (
  distanceKm: number,
  baseFeeFee = 80,
  feePerKm = 20,
  freeAboveDistance = 2 // First 2km included in base fee
): number => {
  if (distanceKm <= freeAboveDistance) {
    return baseFeeFee
  }
  const extraKm = distanceKm - freeAboveDistance
  const extraFee = Math.round(extraKm * feePerKm)
  return baseFeeFee + extraFee
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ESTIMATED DELIVERY TIME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const calculateEstimatedDeliveryMinutes = (
  prepTimeMinutes: number,
  distanceKm: number,
  avgSpeedKmh = 25 // Average rider speed in city
): number => {
  const travelTimeMinutes = Math.ceil((distanceKm / avgSpeedKmh) * 60)
  const buffer = 5 // Buffer for pickup + handoff
  return prepTimeMinutes + travelTimeMinutes + buffer
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OPERATING HOURS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isRestaurantOpen = (
  operatingHours: OperatingHours,
  isActiveToggle: boolean
): boolean => {
  if (!isActiveToggle) return false

  const now = new Date()
  // Use EAT (UTC+3)
  const eatOffset = 3 * 60
  const eatTime = new Date(now.getTime() + eatOffset * 60 * 1000)

  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
  const dayKey = days[eatTime.getUTCDay()]
  const todayHours = operatingHours[dayKey]

  if (todayHours.closed) return false

  const currentMinutes = eatTime.getUTCHours() * 60 + eatTime.getUTCMinutes()
  const [openH, openM] = todayHours.open.split(':').map(Number)
  const [closeH, closeM] = todayHours.close.split(':').map(Number)
  const openMinutes = (openH ?? 0) * 60 + (openM ?? 0)
  const closeMinutes = (closeH ?? 0) * 60 + (closeM ?? 0)

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes
}

export const getClosingTime = (operatingHours: OperatingHours): string | null => {
  const now = new Date()
  const eatOffset = 3 * 60
  const eatTime = new Date(now.getTime() + eatOffset * 60 * 1000)
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
  const dayKey = days[eatTime.getUTCDay()]
  const todayHours = operatingHours[dayKey]
  if (todayHours.closed) return null
  return todayHours.close
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMMISSION CALCULATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const calculateCommission = (
  subtotal: number,
  commissionPercent: number
): { restaurantEarnings: number; platformCommission: number } => {
  const platformCommission = Math.round(subtotal * (commissionPercent / 100))
  const restaurantEarnings = subtotal - platformCommission
  return { restaurantEarnings, platformCommission }
}

export const calculateRiderEarnings = (
  distanceKm: number,
  baseEarning = 80,
  earningsPerKm = 25
): number => {
  const distanceEarning = Math.round(distanceKm * earningsPerKm)
  return baseEarning + distanceEarning
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATE FORMATTING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Africa/Nairobi',
  })
}

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  })
}

export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  })
}

export const timeAgo = (date: string | Date): string => {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDate(date)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STRING UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const generateOTP = (length = 6): string => {
  const digits = '0123456789'
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)]
  }
  return otp
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORDER UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isOrderCancellable = (status: string): boolean => {
  return ['PENDING', 'PAYMENT_PENDING', 'CONFIRMED'].includes(status)
}

export const isOrderActive = (status: string): boolean => {
  return [
    'CONFIRMED',
    'ACCEPTED',
    'PREPARING',
    'READY',
    'ASSIGNED',
    'PICKED_UP',
    'ON_THE_WAY',
    'ARRIVING',
  ].includes(status)
}

export const getOrderStatusMessage = (status: string, restaurantName?: string): string => {
  const name = restaurantName ?? 'the restaurant'
  const messages: Record<string, string> = {
    CONFIRMED: `${name} just got your order! 🧑‍🍳`,
    ACCEPTED: `${name} accepted your order! Preparing now 🍳`,
    PREPARING: `Your food is being lovingly prepared 🍳`,
    READY: `Your food is ready! Waiting for a rider 🏍️`,
    ASSIGNED: `A rider has been assigned to your order! 🏍️`,
    PICKED_UP: `Rider has collected your food! On the way 🏍️`,
    ON_THE_WAY: `Your rider is heading to you! Almost there 🏍️`,
    ARRIVING: `Almost there! You can almost smell it 👃`,
    DELIVERED: `Enjoy your meal! 🎉`,
    CANCELLED: `Your order has been cancelled`,
  }
  return messages[status] ?? `Order status: ${status}`
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGINATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit)
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

export const getPaginationOffset = (page: number, limit: number): number => {
  return (page - 1) * limit
}