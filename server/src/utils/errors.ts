// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOM ERROR HIERARCHY
// All errors extend AppError for consistent handling
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean // true = expected, false = bug

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

// 400 — Client sent invalid data
export class ValidationError extends AppError {
  public readonly details: Array<{ field: string; message: string }>

  constructor(
    message: string,
    details: Array<{ field: string; message: string }> = []
  ) {
    super(message, 400, 'VALIDATION_ERROR')
    this.details = details
  }
}

// 401 — Not authenticated
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', code = 'AUTH_001') {
    super(message, 401, code)
  }
}

// 403 — Authenticated but not allowed
export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'AUTH_004')
  }
}

// 404 — Resource doesn't exist
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_001')
  }
}

// 409 — Duplicate / conflict
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_001')
  }
}

// 422 — Business logic violation (valid request, but can't process)
export class BusinessError extends AppError {
  constructor(message: string, code = 'BUSINESS_001') {
    super(message, 422, code)
  }
}

// 422 — Payment specific
export class PaymentError extends AppError {
  constructor(message: string, code = 'PAYMENT_001') {
    super(message, 422, code)
  }
}

// 422 — Order specific
export class OrderError extends AppError {
  constructor(message: string, code = 'ORDER_001') {
    super(message, 422, code)
  }
}

// 429 — Rate limited
export class RateLimitError extends AppError {
  public readonly retryAfter: number

  constructor(message = 'Too many requests', retryAfterSeconds = 60) {
    super(message, 429, 'RATE_LIMIT_001')
    this.retryAfter = retryAfterSeconds
  }
}

// 503 — External service down
export class ServiceUnavailableError extends AppError {
  constructor(service = 'Service') {
    super(`${service} is temporarily unavailable`, 503, 'SERVICE_UNAVAILABLE_001')
  }
}

// Helper to check if error is one of ours
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}