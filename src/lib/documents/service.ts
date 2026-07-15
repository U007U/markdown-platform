import { type D1Database } from '@cloudflare/workers-types'
import { DocumentRepository } from './repository'
import type { Document, DocumentVersion } from '@/types/database'

export class DocumentService {
  readonly repository: DocumentRepository

  constructor(private db: D1Database) {
    this.repository = new DocumentRepository(db)
  }

  async getDocument(idOrSlug: string) {
    let doc = await this.repository.findById(idOrSlug)
    if (!doc) {
      doc = await this.repository.findBySlug(idOrSlug)
    }
    return doc
  }

  async listDocuments(options: {
    status?: string
    visibility?: string
    author_id?: string
    limit?: number
    offset?: number
    search?: string
  } = {}) {
    const [documents, total] = await Promise.all([
      this.repository.findAll(options),
      this.repository.count(options),
    ])
    return { documents, total }
  }

  async createDocument(authorId: string, data: {
    title: string
    description?: string
    content?: string
    cover_image_url?: string
    category?: string
    visibility?: string
  }) {
    if (!data.title || data.title.trim().length === 0) {
      return { success: false, message: 'Title is required' }
    }

    if (data.title.length > 200) {
      return { success: false, message: 'Title must be under 200 characters' }
    }

    const existing = await this.repository.findBySlug(
      data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
    )
    if (existing) {
      return { success: false, message: 'A document with a similar title already exists' }
    }

    const doc = await this.repository.create({
      author_id: authorId,
      title: data.title.trim(),
      description: data.description,
      content: data.content,
      cover_image_url: data.cover_image_url,
      category: data.category,
      visibility: data.visibility as 'public' | 'unlisted' | 'private' | undefined,
    })

    if (!doc) {
      return { success: false, message: 'Failed to create document' }
    }

    return { success: true, document: doc }
  }

  async updateDocument(id: string, userId: string, data: {
    title?: string
    description?: string
    content?: string
    cover_image_url?: string
    category?: string
    visibility?: string
  }) {
    const doc = await this.repository.findById(id)
    if (!doc) {
      return { success: false, message: 'Document not found' }
    }
    if (doc.author_id !== userId) {
      return { success: false, message: 'Not authorized' }
    }

    const updated = await this.repository.update(id, data)
    return { success: true, document: updated }
  }

  async publishDocument(id: string, userId: string) {
    const doc = await this.repository.findById(id)
    if (!doc) {
      return { success: false, message: 'Document not found' }
    }
    if (doc.author_id !== userId) {
      return { success: false, message: 'Not authorized' }
    }
    if (doc.status === 'published') {
      return { success: false, message: 'Document is already published' }
    }

    const published = await this.repository.publish(id)
    return { success: true, document: published }
  }

  async unpublishDocument(id: string, userId: string) {
    const doc = await this.repository.findById(id)
    if (!doc) {
      return { success: false, message: 'Document not found' }
    }
    if (doc.author_id !== userId) {
      return { success: false, message: 'Not authorized' }
    }

    const unpublished = await this.repository.unpublish(id)
    return { success: true, document: unpublished }
  }

  async deleteDocument(id: string, userId: string) {
    const doc = await this.repository.findById(id)
    if (!doc) {
      return { success: false, message: 'Document not found' }
    }
    if (doc.author_id !== userId) {
      return { success: false, message: 'Not authorized' }
    }

    await this.repository.delete(id)
    return { success: true, message: 'Document deleted' }
  }

  async saveVersion(id: string, userId: string, data: {
    title: string
    content: string
    changelog?: string
  }) {
    const doc = await this.repository.findById(id)
    if (!doc) {
      return { success: false, message: 'Document not found' }
    }
    if (doc.author_id !== userId) {
      return { success: false, message: 'Not authorized' }
    }

    const version = await this.repository.createVersion({
      document_id: id,
      title: data.title,
      content: data.content,
      changelog: data.changelog,
      created_by: userId,
    })

    return { success: true, version }
  }

  async getVersions(id: string) {
    const doc = await this.repository.findById(id)
    if (!doc) {
      return { success: false, message: 'Document not found' }
    }

    const versions = await this.repository.getVersions(id)
    return { success: true, versions }
  }

  async restoreVersion(documentId: string, versionId: string, userId: string) {
    const doc = await this.repository.findById(documentId)
    if (!doc) {
      return { success: false, message: 'Document not found' }
    }
    if (doc.author_id !== userId) {
      return { success: false, message: 'Not authorized' }
    }

    const version = await this.repository.getVersion(versionId)
    if (!version || (version as unknown as Record<string, unknown>).document_id !== documentId) {
      return { success: false, message: 'Version not found' }
    }

    const updated = await this.repository.update(documentId, {
      title: (version as unknown as Record<string, unknown>).title as string,
      content: (version as unknown as Record<string, unknown>).content as string,
    })

    return { success: true, document: updated }
  }

  async getAuthorDocuments(authorId: string, options: { status?: string; limit?: number; offset?: number } = {}) {
    return this.repository.findByAuthor(authorId, options)
  }
}
