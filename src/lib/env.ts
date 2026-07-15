function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export const env = {
  NEXT_PUBLIC_APP_NAME: getEnv('NEXT_PUBLIC_APP_NAME', 'Markdown Platform'),
  NEXT_PUBLIC_APP_URL: getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),

  DATABASE_URL: getEnv('DATABASE_URL', ''),
  DATABASE_TOKEN: getEnv('DATABASE_TOKEN', ''),

  UPSTASH_REDIS_URL: getEnv('UPSTASH_REDIS_URL', ''),
  UPSTASH_REDIS_TOKEN: getEnv('UPSTASH_REDIS_TOKEN', ''),

  NEXTAUTH_URL: getEnv('NEXTAUTH_URL', 'http://localhost:3000/api/auth'),
  NEXTAUTH_SECRET: getEnv('NEXTAUTH_SECRET', 'dev-secret-change-in-production'),

  GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID', ''),
  GOOGLE_CLIENT_SECRET: getEnv('GOOGLE_CLIENT_SECRET', ''),

  GITHUB_CLIENT_ID: getEnv('GITHUB_CLIENT_ID', ''),
  GITHUB_CLIENT_SECRET: getEnv('GITHUB_CLIENT_SECRET', ''),

  DISCORD_CLIENT_ID: getEnv('DISCORD_CLIENT_ID', ''),
  DISCORD_CLIENT_SECRET: getEnv('DISCORD_CLIENT_SECRET', ''),

  R2_ENDPOINT: getEnv('R2_ENDPOINT', ''),
  R2_ACCESS_KEY_ID: getEnv('R2_ACCESS_KEY_ID', ''),
  R2_SECRET_ACCESS_KEY: getEnv('R2_SECRET_ACCESS_KEY', ''),
  R2_BUCKET_NAME: getEnv('R2_BUCKET_NAME', ''),

  MAX_UPLOAD_SIZE: parseInt(getEnv('MAX_UPLOAD_SIZE', '10485760'), 10),

  RESEND_API_KEY: getEnv('RESEND_API_KEY', ''),

  NEXT_PUBLIC_SENTRY_DSN: getEnv('NEXT_PUBLIC_SENTRY_DSN', ''),
  NEXT_PUBLIC_ANALYTICS_ID: getEnv('NEXT_PUBLIC_ANALYTICS_ID', ''),

  SECRET_KEY: getEnv('SECRET_KEY', 'dev-secret-key-change-in-production'),
}
