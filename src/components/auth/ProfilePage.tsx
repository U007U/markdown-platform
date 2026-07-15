'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface UserProfile {
  id: string
  email: string
  username: string
  display_name: string | null
  avatar_url: string | null
  role: string
  email_verified: boolean
  created_at: string
  bio: string | null
  website: string | null
  social_links: string | null
}

export function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: '',
    website: '',
    social_links: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/session')
      const sessionData = await res.json()

      if (!sessionData.authenticated) {
        router.push('/auth')
        return
      }

      const profileRes = await fetch('/api/users/profile')
      const data = await profileRes.json()

      if (profileRes.ok) {
        setUser(data)
        setFormData({
          display_name: data.display_name || '',
          username: data.username,
          bio: data.bio || '',
          website: data.website || '',
          social_links: data.social_links || '',
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Failed to update profile:', data.error)
        return
      }

      setUser(data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Network error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-gray-500">Manage your account information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="display_name" className="text-sm font-medium">
            Display Name
          </label>
          <Input
            id="display_name"
            name="display_name"
            value={formData.display_name}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full min-h-[100px] p-2 border rounded-lg"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="website" className="text-sm font-medium">
            Website
          </label>
          <Input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="social_links" className="text-sm font-medium">
            Social Links (JSON)
          </label>
          <Input
            id="social_links"
            name="social_links"
            value={formData.social_links}
            onChange={handleChange}
            placeholder='{"twitter": "https://twitter.com/username", "github": "https://github.com/username"}'
          />
        </div>

        {success && (
          <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">
            Profile updated successfully!
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Danger Zone</h2>
        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="text-sm font-bold text-red-700 mb-2">Delete Account</h3>
          <p className="text-sm text-red-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button
            variant="destructive"
            onClick={async () => {
              if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                await fetch('/api/users/account', {
                  method: 'DELETE',
                })
                router.push('/')
                router.refresh()
              }
            }}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  )
}
