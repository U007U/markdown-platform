import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function getDocuments(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${BASE_URL}/api/documents?status=published&limit=100`, {
      next: { revalidate: 3600 },
    })
    const data = await res.json()

    if (data.success && data.documents) {
      return data.documents.map((doc: { slug: string; updated_at: string }) => ({
        url: `${BASE_URL}/documents/${doc.slug}`,
        lastModified: new Date(doc.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    }
  } catch {}
  return []
}

async function getCollections(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${BASE_URL}/api/collections?limit=100`, {
      next: { revalidate: 3600 },
    })
    const data = await res.json()

    if (data.success && data.collections) {
      return data.collections.map((col: { id: string; updated_at: string }) => ({
        url: `${BASE_URL}/collections/${col.id}`,
        lastModified: new Date(col.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  } catch {}
  return []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/documents`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  const [documents, collections] = await Promise.all([
    getDocuments(),
    getCollections(),
  ])

  return [...staticPages, ...documents, ...collections]
}
