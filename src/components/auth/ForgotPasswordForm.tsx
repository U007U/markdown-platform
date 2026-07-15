'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      forgotPasswordSchema.parse({ email })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || 'Invalid input')
      }
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send password reset email')
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to {email}
          </p>
        </div>
        <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
          Back to login
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Forgot password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p>
          Remember your password?{' '}
          <a href="/auth/signin" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
