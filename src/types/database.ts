import { D1Database } from '@cloudflare/workers-types'

export interface User {
  id: string
  email: string
  username: string
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
}

export interface Document {
  id: string
  author_id: string
  title: string
  slug: string
  description: string | null
  content: string | null
  cover_image_url: string | null
  category: string | null
  status: 'draft' | 'published' | 'archived'
  visibility: 'public' | 'unlisted' | 'private'
  created_at: string
  updated_at: string | null
  published_at: string | null
  deleted_at: string | null
  view_count: number
  download_count: number
  is_featured: boolean
}

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  title: string
  content: string | null
  changelog: string | null
  created_at: string
  created_by: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  usage_count: number
  created_at: string
}

export interface DocumentTag {
  id: string
  document_id: string
  tag_id: string
  created_at: string
}

export interface Collection {
  id: string
  author_id: string
  title: string
  description: string | null
  cover_image_url: string | null
  is_private: boolean
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  document_count: number
}

export interface CollectionDocument {
  id: string
  collection_id: string
  document_id: string
  order: number
  created_at: string
}

export interface Like {
  id: string
  user_id: string
  document_id: string
  created_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  document_id: string
  collection_id: string | null
  created_at: string
}

export interface Download {
  id: string
  user_id: string | null
  document_id: string
  created_at: string
}

export interface Comment {
  id: string
  document_id: string
  user_id: string | null
  parent_comment_id: string | null
  content: string
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  like_count: number
  reply_count: number
}

export interface DatabaseClient {
  db: D1Database
}
