import { type D1Database } from '@cloudflare/workers-types'

export async function generateToken(length: number = 32): Promise<string> {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function generateEmailVerificationToken(userId: string): Promise<string> {
  const token = await generateToken(32)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  return JSON.stringify({
    token,
    userId,
    expiresAt,
  })
}

export async function generatePasswordResetToken(userId: string): Promise<string> {
  const token = await generateToken(32)
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

export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')
}
