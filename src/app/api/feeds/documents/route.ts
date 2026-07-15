import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { DocumentRepository } from '@/lib/documents/repository'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(request: NextRequest) {
  try {
    const db = createDB()
    const repo = new DocumentRepository(db)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const documents = await repo.findAll({
      status: 'published',
      visibility: 'public',
      sort: 'newest',
      limit: Math.min(limit, 100),
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const now = new Date().toISOString()

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Markdown Platform</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>A platform for publishing and discovering high-quality Markdown documents</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${escapeXml(baseUrl)}/api/feeds/documents" rel="self" type="application/rss+xml"/>
    ${documents.map((doc) => `
    <item>
      <title>${escapeXml(doc.title)}</title>
      <link>${escapeXml(baseUrl)}/documents/${escapeXml(doc.slug)}</link>
      <guid isPermaLink="true">${escapeXml(baseUrl)}/documents/${escapeXml(doc.slug)}</guid>
      <pubDate>${new Date(doc.published_at || doc.created_at).toUTCString()}</pubDate>
      ${doc.description ? `<description>${escapeXml(doc.description)}</description>` : ''}
      ${doc.category ? `<category>${escapeXml(doc.category)}</category>` : ''}
      <content:encoded><![CDATA[${doc.content || ''}]]></content:encoded>
    </item>`).join('')}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('RSS feed error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
