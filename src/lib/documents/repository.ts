import { type D1Database } from '@cloudflare/workers-types'
import type { Document, DocumentVersion } from '@/types/database'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export class DocumentRepository {
  constructor(private db: D1Database) {}

  async findById(id: string): Promise<Document | null> {
    return this.db
      .prepare('SELECT * FROM documents WHERE id = ? AND deleted_at IS NULL')
      .bind(id)
      .first<Document>()
  }

  async findBySlug(slug: string): Promise<Document | null> {
    return this.db
      .prepare('SELECT * FROM documents WHERE slug = ? AND deleted_at IS NULL')
      .bind(slug)
      .first<Document>()
  }

  async findAll(options: {
    status?: string
    visibility?: string
    author_id?: string
    category?: string
    tag?: string
    sort?: 'newest' | 'oldest' | 'popular' | 'downloads' | 'featured'
    limit?: number
    offset?: number
    search?: string
  } = {}): Promise<Document[]> {
    const conditions: string[] = ['d.deleted_at IS NULL']
    const bindings: unknown[] = []
    let joinClause = ''

    if (options.status) {
      conditions.push('d.status = ?')
      bindings.push(options.status)
    }
    if (options.visibility) {
      conditions.push('d.visibility = ?')
      bindings.push(options.visibility)
    }
    if (options.author_id) {
      conditions.push('d.author_id = ?')
      bindings.push(options.author_id)
    }
    if (options.category) {
      conditions.push('d.category = ?')
      bindings.push(options.category)
    }
    if (options.tag) {
      joinClause = 'INNER JOIN document_tags dt ON d.id = dt.document_id INNER JOIN tags t ON dt.tag_id = t.id'
      conditions.push('t.slug = ?')
      bindings.push(options.tag)
    }
    if (options.search) {
      conditions.push('(d.title LIKE ? OR d.description LIKE ?)')
      bindings.push(`%${options.search}%`, `%${options.search}%`)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const limit = options.limit || 20
    const offset = options.offset || 0

    const sortMap: Record<string, string> = {
      newest: 'd.created_at DESC',
      oldest: 'd.created_at ASC',
      popular: 'd.view_count DESC',
      downloads: 'd.download_count DESC',
      featured: 'd.is_featured DESC, d.created_at DESC',
    }
    const orderBy = sortMap[options.sort || 'newest'] || sortMap.newest

    const result = await this.db
      .prepare(`SELECT d.* FROM documents d ${joinClause} ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
      .bind(...bindings, limit, offset)
      .all<Document>()

    return result.results as unknown as Document[]
  }

  // Lightweight version for list views (excludes content field)
  async findManyLight(options: {
    status?: string
    visibility?: string
    author_id?: string
    category?: string
    tag?: string
    sort?: 'newest' | 'oldest' | 'popular' | 'downloads' | 'featured'
    limit?: number
    offset?: number
    search?: string
  } = {}): Promise<Document[]> {
    const conditions: string[] = ['d.deleted_at IS NULL']
    const bindings: unknown[] = []
    let joinClause = ''

    if (options.status) {
      conditions.push('d.status = ?')
      bindings.push(options.status)
    }
    if (options.visibility) {
      conditions.push('d.visibility = ?')
      bindings.push(options.visibility)
    }
    if (options.author_id) {
      conditions.push('d.author_id = ?')
      bindings.push(options.author_id)
    }
    if (options.category) {
      conditions.push('d.category = ?')
      bindings.push(options.category)
    }
    if (options.tag) {
      joinClause = 'INNER JOIN document_tags dt ON d.id = dt.document_id INNER JOIN tags t ON dt.tag_id = t.id'
      conditions.push('t.slug = ?')
      bindings.push(options.tag)
    }
    if (options.search) {
      conditions.push('(d.title LIKE ? OR d.description LIKE ?)')
      bindings.push(`%${options.search}%`, `%${options.search}%`)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const limit = options.limit || 20
    const offset = options.offset || 0

    const sortMap: Record<string, string> = {
      newest: 'd.created_at DESC',
      oldest: 'd.created_at ASC',
      popular: 'd.view_count DESC',
      downloads: 'd.download_count DESC',
      featured: 'd.is_featured DESC, d.created_at DESC',
    }
    const orderBy = sortMap[options.sort || 'newest'] || sortMap.newest

    const result = await this.db
      .prepare(`SELECT d.id, d.author_id, d.title, d.slug, d.description, d.cover_image_url, d.category, d.status, d.visibility, d.created_at, d.published_at, d.view_count, d.download_count, d.is_featured FROM documents d ${joinClause} ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
      .bind(...bindings, limit, offset)
      .all()

    return result.results as unknown as Document[]
  }

  async count(options: {
    status?: string
    visibility?: string
    author_id?: string
    category?: string
    tag?: string
    search?: string
  } = {}): Promise<number> {
    const conditions: string[] = ['d.deleted_at IS NULL']
    const bindings: unknown[] = []
    let joinClause = ''

    if (options.status) {
      conditions.push('d.status = ?')
      bindings.push(options.status)
    }
    if (options.visibility) {
      conditions.push('d.visibility = ?')
      bindings.push(options.visibility)
    }
    if (options.author_id) {
      conditions.push('d.author_id = ?')
      bindings.push(options.author_id)
    }
    if (options.category) {
      conditions.push('d.category = ?')
      bindings.push(options.category)
    }
    if (options.tag) {
      joinClause = 'INNER JOIN document_tags dt ON d.id = dt.document_id INNER JOIN tags t ON dt.tag_id = t.id'
      conditions.push('t.slug = ?')
      bindings.push(options.tag)
    }
    if (options.search) {
      conditions.push('(d.title LIKE ? OR d.description LIKE ?)')
      bindings.push(`%${options.search}%`, `%${options.search}%`)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const result = await this.db
      .prepare(`SELECT COUNT(*) as count FROM documents d ${joinClause} ${where}`)
      .bind(...bindings)
      .first<{ count: number }>()

    return (result as Record<string, unknown>)?.count as number || 0
  }

  async create(data: {
    author_id: string
    title: string
    description?: string
    content?: string
    cover_image_url?: string
    category?: string
    status?: string
    visibility?: string
  }): Promise<Document | null> {
    const id = crypto.randomUUID()
    const slug = slugify(data.title)
    const now = new Date().toISOString()

    await this.db
      .prepare(
        `INSERT INTO documents (id, author_id, title, slug, description, content, cover_image_url, category, status, visibility, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        data.author_id,
        data.title,
        slug,
        data.description || null,
        data.content || null,
        data.cover_image_url || null,
        data.category || null,
        data.status || 'draft',
        data.visibility || 'public',
        now
      )
      .run()

    return this.findById(id)
  }

  async update(id: string, data: {
    title?: string
    description?: string
    content?: string
    cover_image_url?: string
    category?: string
    visibility?: string
  }): Promise<Document | null> {
    const updates: string[] = []
    const bindings: unknown[] = []

    if (data.title !== undefined) {
      updates.push('title = ?')
      bindings.push(data.title)
      updates.push('slug = ?')
      bindings.push(slugify(data.title))
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      bindings.push(data.description)
    }
    if (data.content !== undefined) {
      updates.push('content = ?')
      bindings.push(data.content)
    }
    if (data.cover_image_url !== undefined) {
      updates.push('cover_image_url = ?')
      bindings.push(data.cover_image_url)
    }
    if (data.category !== undefined) {
      updates.push('category = ?')
      bindings.push(data.category)
    }
    if (data.visibility !== undefined) {
      updates.push('visibility = ?')
      bindings.push(data.visibility)
    }

    if (updates.length === 0) return this.findById(id)

    bindings.push(new Date().toISOString(), id)
    await this.db
      .prepare(`UPDATE documents SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`)
      .bind(...bindings)
      .run()

    return this.findById(id)
  }

  async publish(id: string): Promise<Document | null> {
    await this.db
      .prepare(
        "UPDATE documents SET status = 'published', published_at = ?, updated_at = ? WHERE id = ?"
      )
      .bind(new Date().toISOString(), new Date().toISOString(), id)
      .run()
    return this.findById(id)
  }

  async unpublish(id: string): Promise<Document | null> {
    await this.db
      .prepare(
        "UPDATE documents SET status = 'draft', published_at = NULL, updated_at = ? WHERE id = ?"
      )
      .bind(new Date().toISOString(), id)
      .run()
    return this.findById(id)
  }

  async delete(id: string): Promise<void> {
    await this.db
      .prepare('UPDATE documents SET deleted_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), id)
      .run()
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.db
      .prepare('UPDATE documents SET view_count = view_count + 1 WHERE id = ?')
      .bind(id)
      .run()
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.db
      .prepare('UPDATE documents SET download_count = download_count + 1 WHERE id = ?')
      .bind(id)
      .run()
  }

  // Version management
  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    const result = await this.db
      .prepare('SELECT * FROM document_versions WHERE document_id = ? ORDER BY version_number DESC')
      .bind(documentId)
      .all<DocumentVersion>()
    return result.results as unknown as DocumentVersion[]
  }

  async getVersion(versionId: string): Promise<DocumentVersion | null> {
    return this.db
      .prepare('SELECT * FROM document_versions WHERE id = ?')
      .bind(versionId)
      .first<DocumentVersion>()
  }

  async createVersion(data: {
    document_id: string
    title: string
    content: string
    changelog?: string
    created_by: string
  }): Promise<DocumentVersion | null> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const lastVersion = await this.db
      .prepare(
        'SELECT MAX(version_number) as max_version FROM document_versions WHERE document_id = ?'
      )
      .bind(data.document_id)
      .first<{ max_version: number }>()

    const versionNumber = ((lastVersion as Record<string, unknown>)?.max_version as number || 0) + 1

    await this.db
      .prepare(
        `INSERT INTO document_versions (id, document_id, version_number, title, content, changelog, created_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        data.document_id,
        versionNumber,
        data.title,
        data.content,
        data.changelog || null,
        now,
        data.created_by
      )
      .run()

    return this.getVersion(id)
  }

  // Tag management
  async getDocumentTags(documentId: string) {
    const result = await this.db
      .prepare(
        `SELECT t.* FROM tags t
         INNER JOIN document_tags dt ON t.id = dt.tag_id
         WHERE dt.document_id = ?`
      )
      .bind(documentId)
      .all()
    return result.results
  }

  async addTagToDocument(documentId: string, tagId: string) {
    const id = crypto.randomUUID()
    await this.db
      .prepare(
        'INSERT OR IGNORE INTO document_tags (id, document_id, tag_id, created_at) VALUES (?, ?, ?, ?)'
      )
      .bind(id, documentId, tagId, new Date().toISOString())
      .run()
  }

  async removeTagFromDocument(documentId: string, tagId: string) {
    await this.db
      .prepare('DELETE FROM document_tags WHERE document_id = ? AND tag_id = ?')
      .bind(documentId, tagId)
      .run()
  }

  async findByAuthor(authorId: string, options: { status?: string; limit?: number; offset?: number } = {}) {
    return this.findAll({ ...options, author_id: authorId })
  }

  // Categories
  async getCategories(): Promise<{ category: string; count: number }[]> {
    const result = await this.db
      .prepare(
        `SELECT category, COUNT(*) as count FROM documents
         WHERE deleted_at IS NULL AND status = 'published' AND category IS NOT NULL
         GROUP BY category ORDER BY count DESC`
      )
      .all()
    return result.results as unknown as { category: string; count: number }[]
  }

  // Tags
  async getAllTags() {
    const result = await this.db
      .prepare('SELECT * FROM tags ORDER BY usage_count DESC')
      .all()
    return result.results
  }

  async getPopularTags(limit: number = 20) {
    const result = await this.db
      .prepare('SELECT * FROM tags ORDER BY usage_count DESC LIMIT ?')
      .bind(limit)
      .all()
    return result.results
  }

  async findOrCreateTag(name: string, slug: string): Promise<string> {
    const existing = await this.db
      .prepare('SELECT id FROM tags WHERE slug = ?')
      .bind(slug)
      .first<{ id: string }>()

    if (existing) {
      return (existing as Record<string, unknown>).id as string
    }

    const id = crypto.randomUUID()
    await this.db
      .prepare('INSERT INTO tags (id, name, slug, usage_count, created_at) VALUES (?, ?, ?, 0, ?)')
      .bind(id, name, slug, new Date().toISOString())
      .run()
    return id
  }

  async incrementTagUsage(tagId: string) {
    await this.db
      .prepare('UPDATE tags SET usage_count = usage_count + 1 WHERE id = ?')
      .bind(tagId)
      .run()
  }

  // Likes
  async likeDocument(userId: string, documentId: string): Promise<boolean> {
    const existing = await this.db
      .prepare('SELECT id FROM likes WHERE user_id = ? AND document_id = ?')
      .bind(userId, documentId)
      .first()

    if (existing) return false

    const id = crypto.randomUUID()
    await this.db
      .prepare('INSERT INTO likes (id, user_id, document_id, created_at) VALUES (?, ?, ?, ?)')
      .bind(id, userId, documentId, new Date().toISOString())
      .run()
    return true
  }

  async unlikeDocument(userId: string, documentId: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM likes WHERE user_id = ? AND document_id = ?')
      .bind(userId, documentId)
      .run()
    return (result as unknown as Record<string, unknown>).changes as number > 0
  }

  async isLikedByUser(userId: string, documentId: string): Promise<boolean> {
    const like = await this.db
      .prepare('SELECT id FROM likes WHERE user_id = ? AND document_id = ?')
      .bind(userId, documentId)
      .first()
    return !!like
  }

  async getLikeCount(documentId: string): Promise<number> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM likes WHERE document_id = ?')
      .bind(documentId)
      .first<{ count: number }>()
    return (result as unknown as Record<string, unknown>)?.count as number || 0
  }

  // Bookmarks
  async bookmarkDocument(userId: string, documentId: string): Promise<boolean> {
    const existing = await this.db
      .prepare('SELECT id FROM bookmarks WHERE user_id = ? AND document_id = ?')
      .bind(userId, documentId)
      .first()

    if (existing) return false

    const id = crypto.randomUUID()
    await this.db
      .prepare('INSERT INTO bookmarks (id, user_id, document_id, created_at) VALUES (?, ?, ?, ?)')
      .bind(id, userId, documentId, new Date().toISOString())
      .run()
    return true
  }

  async unbookmarkDocument(userId: string, documentId: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM bookmarks WHERE user_id = ? AND document_id = ?')
      .bind(userId, documentId)
      .run()
    return (result as unknown as Record<string, unknown>).changes as number > 0
  }

  async isBookmarkedByUser(userId: string, documentId: string): Promise<boolean> {
    const bookmark = await this.db
      .prepare('SELECT id FROM bookmarks WHERE user_id = ? AND document_id = ?')
      .bind(userId, documentId)
      .first()
    return !!bookmark
  }

  // Related documents
  async getRelatedDocuments(documentId: string, limit: number = 5): Promise<Document[]> {
    const doc = await this.findById(documentId)
    if (!doc) return []

    const result = await this.db
      .prepare(
        `SELECT d.* FROM documents d
         LEFT JOIN document_tags dt ON d.id = dt.document_id
         WHERE d.id != ? AND d.deleted_at IS NULL AND d.status = 'published'
         AND (d.category = ? OR dt.tag_id IN (
           SELECT tag_id FROM document_tags WHERE document_id = ?
         ))
         GROUP BY d.id
         ORDER BY COUNT(dt.tag_id) DESC, d.view_count DESC
         LIMIT ?`
      )
      .bind(documentId, doc.category, documentId, limit)
      .all<Document>()

    return result.results as unknown as Document[]
  }

  // Author info
  async getAuthorInfo(userId: string) {
    return this.db
      .prepare(
        `SELECT id, username, display_name, avatar_url, bio, website, created_at
         FROM users WHERE id = ?`
      )
      .bind(userId)
      .first()
  }

  async getAuthorStats(userId: string) {
    const docs = await this.db
      .prepare(
        `SELECT
           COUNT(*) as total_documents,
           SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
           SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
           SUM(view_count) as total_views,
           SUM(download_count) as total_downloads
         FROM documents WHERE author_id = ? AND deleted_at IS NULL`
      )
      .bind(userId)
      .first()
    return docs
  }

  // Collections
  async getCollections(userId?: string) {
    const conditions = ['c.deleted_at IS NULL']
    const bindings: unknown[] = []

    if (userId) {
      conditions.push('c.author_id = ?')
      bindings.push(userId)
    } else {
      conditions.push('c.is_private = 0')
    }

    const where = conditions.join(' AND ')
    const result = await this.db
      .prepare(
        `SELECT c.*, u.username, u.display_name, u.avatar_url
         FROM collections c
         LEFT JOIN users u ON c.author_id = u.id
         WHERE ${where}
         ORDER BY c.created_at DESC`
      )
      .bind(...bindings)
      .all()
    return result.results
  }

  async getCollectionById(id: string) {
    return this.db
      .prepare(
        `SELECT c.*, u.username, u.display_name, u.avatar_url
         FROM collections c
         LEFT JOIN users u ON c.author_id = u.id
         WHERE c.id = ? AND c.deleted_at IS NULL`
      )
      .bind(id)
      .first()
  }

  async createCollection(data: {
    author_id: string
    title: string
    description?: string
    cover_image_url?: string
    is_private?: boolean
  }) {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await this.db
      .prepare(
        `INSERT INTO collections (id, author_id, title, description, cover_image_url, is_private, created_at, document_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`
      )
      .bind(id, data.author_id, data.title, data.description || null, data.cover_image_url || null, data.is_private ? 1 : 0, now)
      .run()
    return this.getCollectionById(id)
  }

  async updateCollection(id: string, data: {
    title?: string
    description?: string
    cover_image_url?: string
    is_private?: boolean
  }) {
    const updates: string[] = []
    const bindings: unknown[] = []

    if (data.title !== undefined) { updates.push('title = ?'); bindings.push(data.title) }
    if (data.description !== undefined) { updates.push('description = ?'); bindings.push(data.description) }
    if (data.cover_image_url !== undefined) { updates.push('cover_image_url = ?'); bindings.push(data.cover_image_url) }
    if (data.is_private !== undefined) { updates.push('is_private = ?'); bindings.push(data.is_private ? 1 : 0) }

    if (updates.length === 0) return this.getCollectionById(id)

    bindings.push(new Date().toISOString(), id)
    await this.db
      .prepare(`UPDATE collections SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`)
      .bind(...bindings)
      .run()
    return this.getCollectionById(id)
  }

  async deleteCollection(id: string) {
    await this.db
      .prepare('UPDATE collections SET deleted_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), id)
      .run()
  }

  async addDocumentToCollection(collectionId: string, documentId: string) {
    const existing = await this.db
      .prepare('SELECT id FROM collection_documents WHERE collection_id = ? AND document_id = ?')
      .bind(collectionId, documentId)
      .first()
    if (existing) return

    const maxOrder = await this.db
      .prepare('SELECT MAX("order") as max_order FROM collection_documents WHERE collection_id = ?')
      .bind(collectionId)
      .first<{ max_order: number }>()

    const order = ((maxOrder as Record<string, unknown>)?.max_order as number || 0) + 1
    const id = crypto.randomUUID()
    await this.db
      .prepare(
        'INSERT INTO collection_documents (id, collection_id, document_id, "order", created_at) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(id, collectionId, documentId, order, new Date().toISOString())
      .run()

    await this.db
      .prepare('UPDATE collections SET document_count = document_count + 1 WHERE id = ?')
      .bind(collectionId)
      .run()
  }

  async removeDocumentFromCollection(collectionId: string, documentId: string) {
    await this.db
      .prepare('DELETE FROM collection_documents WHERE collection_id = ? AND document_id = ?')
      .bind(collectionId, documentId)
      .run()
    await this.db
      .prepare('UPDATE collections SET document_count = document_count - 1 WHERE id = ?')
      .bind(collectionId)
      .run()
  }

  async getCollectionDocuments(collectionId: string) {
    const result = await this.db
      .prepare(
        `SELECT d.* FROM documents d
         INNER JOIN collection_documents cd ON d.id = cd.document_id
         WHERE cd.collection_id = ? AND d.deleted_at IS NULL
         ORDER BY cd."order"`
      )
      .bind(collectionId)
      .all<Document>()
    return result.results as unknown as Document[]
  }

  // Featured documents
  async getFeatured(limit: number = 6): Promise<Document[]> {
    const result = await this.db
      .prepare(
        `SELECT d.* FROM documents d
         WHERE d.deleted_at IS NULL AND d.status = 'published' AND d.is_featured = 1
         ORDER BY d.published_at DESC
         LIMIT ?`
      )
      .bind(limit)
      .all<Document>()
    return result.results as unknown as Document[]
  }

  // Trending documents (most liked in last 30 days)
  async getTrending(limit: number = 6): Promise<Document[]> {
    const result = await this.db
      .prepare(
        `SELECT d.*, COUNT(l.id) as recent_likes
         FROM documents d
         LEFT JOIN likes l ON d.id = l.document_id AND l.created_at > datetime('now', '-30 days')
         WHERE d.deleted_at IS NULL AND d.status = 'published'
         GROUP BY d.id
         ORDER BY recent_likes DESC, d.view_count DESC
         LIMIT ?`
      )
      .bind(limit)
      .all<Document>()
    return result.results as unknown as Document[]
  }

  // Get user's public collections
  async getUserCollections(userId: string) {
    const result = await this.db
      .prepare(
        `SELECT c.* FROM collections c
         WHERE c.author_id = ? AND c.deleted_at IS NULL AND c.is_private = 0
         ORDER BY c.created_at DESC`
      )
      .bind(userId)
      .all()
    return result.results
  }
}
