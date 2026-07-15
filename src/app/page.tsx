'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { Button } from '@/components/ui/Button'
import type { Document } from '@/types/database'

export default function Home() {
  const [featured, setFeatured] = useState<Document[]>([])
  const [trending, setTrending] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [featuredRes, trendingRes] = await Promise.all([
        fetch('/api/documents/featured?limit=3'),
        fetch('/api/documents/trending?limit=3'),
      ])

      const featuredData = await featuredRes.json()
      const trendingData = await trendingRes.json()

      setFeatured(featuredData.documents || [])
      setTrending(trendingData.documents || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Markdown Platform</h1>
          <p className="text-xl text-gray-500 mb-8">
            A platform for publishing and discovering high-quality Markdown documents
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/documents">
              <Button size="lg">Browse Documents</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Documents */}
      {!loading && featured.length > 0 && (
        <section className="py-12 px-4 bg-gray-50">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Documents</h2>
              <Link href="/documents?sort=featured" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Documents */}
      {!loading && trending.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Trending This Month</h2>
              <Link href="/documents?sort=popular" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trending.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Collections CTA */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-bold mb-4">Explore Collections</h2>
          <p className="text-gray-500 mb-6">
            Curated sets of documents organized by topic
          </p>
          <Link href="/collections">
            <Button variant="outline">Browse Collections</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
