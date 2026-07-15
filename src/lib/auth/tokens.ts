import { type D1Database } from '@cloudflare/workers-types'
import { createHash, randomBytes } from 'crypto'

export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

export function generateEmailVerificationToken(userId: string): string {
  const token = generateToken(32)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  return JSON.stringify({
    token,
    userId,
    expiresAt,
  })
}

export function generatePasswordResetToken(userId: string): string {
  const token = generateToken(32)
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()

  return JSON.stringify({
    token,
    userId,
    expiresAt,
  })
}

export function verifyToken(token: string): { userId: string; expiresAt: string } | null {
  try {
    const parsed = JSON.parse(token)
    const expiresAt = new Date(parsed.expiresAt)
    if (expiresAt < new Date()) {
      return null
    }
    return { userId: parsed.userId, expiresAt: parsed.expiresAt }
  } catch {
    return null
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
