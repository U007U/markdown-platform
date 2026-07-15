import { type D1Database } from '@cloudflare/workers-types'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyPrefix?: string
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export class RateLimiter {
  private db: D1Database | null
  private config: RateLimitConfig

  constructor(db: D1Database | null, config: RateLimitConfig) {
    this.db = db
    this.config = {
      windowMs: config.windowMs || 60000, // 1 minute default
      maxRequests: config.maxRequests || 100,
      keyPrefix: config.keyPrefix || 'rl',
    }
  }

  private getKey(identifier: string): string {
    return `${this.config.keyPrefix}:${identifier}`
  }

  async check(identifier: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key = this.getKey(identifier)
    const now = Date.now()
    const resetAt = now + this.config.windowMs

    // Try memory store first (for development)
    const existing = rateLimitStore.get(key)

    if (existing && existing.resetAt > now) {
      if (existing.count >= this.config.maxRequests) {
        return { allowed: false, remaining: 0, resetAt: existing.resetAt }
      }
      existing.count++
      return { allowed: true, remaining: this.config.maxRequests - existing.count, resetAt: existing.resetAt }
    }

    // Create new entry
    rateLimitStore.set(key, { count: 1, resetAt })

    // Cleanup old entries periodically
    if (rateLimitStore.size > 10000) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.resetAt < now) {
          rateLimitStore.delete(k)
        }
      }
    }

    return { allowed: true, remaining: this.config.maxRequests - 1, resetAt }
  }

  async reset(identifier: string): Promise<void> {
    const key = this.getKey(identifier)
    rateLimitStore.delete(key)
  }
}

// Pre-configured rate limiters
export const authLimiter = (db: D1Database | null) =>
  new RateLimiter(db, { windowMs: 15 * 60 * 1000, maxRequests: 10, keyPrefix: 'auth' }) // 10 attempts per 15 min

export const apiLimiter = (db: D1Database | null) =>
  new RateLimiter(db, { windowMs: 60 * 1000, maxRequests: 100, keyPrefix: 'api' }) // 100 requests per minute

export const commentLimiter = (db: D1Database | null) =>
  new RateLimiter(db, { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: 'comment' }) // 10 comments per minute

export const downloadLimiter = (db: D1Database | null) =>
  new RateLimiter(db, { windowMs: 60 * 1000, maxRequests: 20, keyPrefix: 'download' }) // 20 downloads per minute
