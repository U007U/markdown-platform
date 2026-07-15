export interface User {
  id: string
  email: string
  username: string
  password: string
  display_name: string | null
  avatar_url: string | null
  role: 'guest' | 'user' | 'author' | 'moderator' | 'admin'
  email_verified: boolean
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  bio: string | null
  website: string | null
  social_links: string | null
  failed_login_attempts?: number
  last_failed_login?: string | null
}

export type UserRole = 'guest' | 'user' | 'author' | 'moderator' | 'admin'

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  username: string
  password: string
  display_name?: string
}

export interface LoginOutput {
  success: boolean
  user: User | null
  message?: string
}

export interface RegisterOutput {
  success: boolean
  user?: User
  message?: string
}

export interface PasswordResetOutput {
  success: boolean
  message?: string
}

export interface AuthConfig {
  jwtSecret: string
  jwtExpiresIn: string
  passwordMinLength: number
  maxLoginAttempts: number
  lockoutDuration: number
}

export interface RateLimitConfig {
  windowMs: number
  max: number
}
