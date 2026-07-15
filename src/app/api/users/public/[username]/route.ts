import { NextRequest, NextResponse } from 'next/server'
import { createDB } from '@/lib/db/client'
import { DocumentRepository } from '@/lib/documents/repository'
import { UserRepository } from '@/lib/auth/userRepository'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const db = createDB()
    const { username } = await params
    const { searchParams } = new URL(request.url)

    const userRepo = new UserRepository(db)
    const user = await userRepo.findByUsername(username) as Record<string, unknown> | null

    if (!user || user.deleted_at) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const docRepo = new DocumentRepository(db)
    const stats = await docRepo.getAuthorStats(user.id as string) as Record<string, unknown> | null

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        website: user.website,
        social_links: user.social_links,
        created_at: user.created_at,
      },
      stats: {
        total_documents: stats?.total_documents || 0,
        published: stats?.published || 0,
        drafts: stats?.drafts || 0,
        total_views: stats?.total_views || 0,
        total_downloads: stats?.total_downloads || 0,
      },
    })
  } catch (error) {
    console.error('Public profile error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
