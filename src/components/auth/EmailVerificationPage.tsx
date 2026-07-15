'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function EmailVerificationPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('No verification token provided')
        return
      }

      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (!res.ok) {
          setStatus('error')
          setMessage(data.error || 'Email verification failed')
          return
        }

        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
      } catch (err) {
        setStatus('error')
        setMessage('Network error. Please try again.')
      }
    }

    verifyEmail()
  }, [])

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">
          {status === 'verifying' ? 'Verifying your email...' : 
           status === 'success' ? 'Email verified!' : 'Verification failed'}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">{message}</p>
      </div>

      {status === 'success' && (
        <Button onClick={() => router.push('/auth/signin')} className="w-full">
          Sign in
        </Button>
      )}

      {status === 'error' && (
        <div className="mt-4">
          <Button onClick={() => router.push('/auth/signup')} variant="outline" className="w-full">
            Sign up again
          </Button>
        </div>
      )}
    </div>
  )
}
