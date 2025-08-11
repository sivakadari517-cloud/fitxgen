// Rate limiting utility for API endpoints
import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 10 * 60 * 1000)

interface RateLimitOptions {
  windowMs: number    // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyGenerator?: (req: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export class RateLimit {
  private options: Required<RateLimitOptions>

  constructor(options: RateLimitOptions) {
    this.options = {
      keyGenerator: (req) => this.getClientId(req),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...options
    }
  }

  private getClientId(req: NextRequest): string {
    // Try to get the real IP address
    const forwarded = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const clientIp = forwarded?.split(',')[0] || realIp || 'unknown'
    
    // Include user agent for better identification
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    return `${clientIp}:${userAgent.substring(0, 50)}`
  }

  async check(req: NextRequest): Promise<RateLimitResult> {
    const key = this.options.keyGenerator(req)
    const now = Date.now()
    const windowStart = now - this.options.windowMs

    let entry = rateLimitStore.get(key)

    // Clean up or create new entry
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.options.windowMs,
        firstRequest: now
      }
    }

    // Check if request should be counted
    const shouldCount = true // We'll implement skip logic later if needed

    if (shouldCount) {
      entry.count++
    }

    rateLimitStore.set(key, entry)

    const remaining = Math.max(0, this.options.maxRequests - entry.count)
    const isLimited = entry.count > this.options.maxRequests

    return {
      isLimited,
      limit: this.options.maxRequests,
      remaining,
      resetTime: entry.resetTime,
      retryAfter: isLimited ? Math.ceil((entry.resetTime - now) / 1000) : null
    }
  }
}

export interface RateLimitResult {
  isLimited: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter: number | null
}

// Pre-configured rate limiters
export const authRateLimit = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 attempts per window
})

export const apiRateLimit = new RateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 requests per minute
})

export const paymentRateLimit = new RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10 // 10 payment attempts per hour
})

export const feedbackRateLimit = new RateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5 // 5 feedback submissions per minute
})

// Middleware factory for Next.js API routes
export function withRateLimit(rateLimit: RateLimit) {
  return async function rateLimitMiddleware(req: NextRequest): Promise<Response | null> {
    const result = await rateLimit.check(req)
    
    if (result.isLimited) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            'Retry-After': result.retryAfter?.toString() || '60'
          }
        }
      )
    }

    return null // Continue with request
  }
}

// Advanced rate limiting for different user types
export class TieredRateLimit {
  private limits: Map<string, RateLimit>

  constructor() {
    this.limits = new Map([
      // Anonymous users - strict limits
      ['anonymous', new RateLimit({
        windowMs: 60 * 1000,
        maxRequests: 20
      })],
      
      // Authenticated users - moderate limits
      ['authenticated', new RateLimit({
        windowMs: 60 * 1000,
        maxRequests: 100
      })],
      
      // Premium users - relaxed limits
      ['premium', new RateLimit({
        windowMs: 60 * 1000,
        maxRequests: 500
      })],
      
      // Admin users - very high limits
      ['admin', new RateLimit({
        windowMs: 60 * 1000,
        maxRequests: 1000
      })]
    ])
  }

  async check(req: NextRequest, userType: 'anonymous' | 'authenticated' | 'premium' | 'admin'): Promise<RateLimitResult> {
    const rateLimit = this.limits.get(userType) || this.limits.get('anonymous')!
    return await rateLimit.check(req)
  }
}

export const tieredRateLimit = new TieredRateLimit()

// Security event logging for rate limit violations
export function logRateLimitViolation(req: NextRequest, result: RateLimitResult) {
  const clientId = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'
  const timestamp = new Date().toISOString()

  console.warn('RATE_LIMIT_VIOLATION', {
    timestamp,
    clientId,
    userAgent,
    path: req.nextUrl.pathname,
    method: req.method,
    limit: result.limit,
    attempts: result.limit - result.remaining + 1,
    windowMs: result.resetTime - Date.now()
  })

  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: send to security service
    fetch('/api/security/alert', {
      method: 'POST',
      body: JSON.stringify({
        type: 'rate_limit_violation',
        clientId,
        path: req.nextUrl.pathname,
        timestamp
      })
    }).catch(() => {}) // Silent fail
  }
}

// Distributed rate limiting (for production with Redis)
export class DistributedRateLimit {
  // Implementation would use Redis for distributed rate limiting
  // This is a placeholder for production enhancement
  
  constructor(private redisClient?: any) {}
  
  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    // Redis-based implementation for production scaling
    throw new Error('Distributed rate limiting requires Redis client')
  }
}