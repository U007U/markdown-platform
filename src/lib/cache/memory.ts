interface CacheEntry<T> {
  data: T
  expiresAt: number
}

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>()
  private defaultTTL: number

  constructor(defaultTTL: number = 60000) {
    this.defaultTTL = defaultTTL

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)
    this.store.set(key, { data, expiresAt })
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key)
      }
    }
  }

  clear(): void {
    this.store.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key)
      }
    }
  }

  get size(): number {
    return this.store.size
  }
}

// Singleton cache instance
export const cache = new MemoryCache(60000) // 1 minute default TTL

// Cache helper for API routes
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  const data = await fetcher()
  cache.set(key, data, ttl)
  return data
}
