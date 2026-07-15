import { type D1Database } from '@cloudflare/workers-types'

export class D1Client {
  constructor(private db: D1Database) {}

  async prepare(query: string) {
    return this.db.prepare(query)
  }

  async get<T>(query: string, bindings?: any[]) {
    const statement = this.db.prepare(query)
    const result = await statement.bind(...(bindings || [])).first<T>()
    return result
  }

  async all<T>(query: string, bindings?: any[]) {
    const statement = this.db.prepare(query)
    const result = await statement.bind(...(bindings || [])).all<T>()
    return result
  }

  async run(query: string, bindings?: any[]) {
    const statement = this.db.prepare(query)
    const result = await statement.bind(...(bindings || [])).run()
    return result
  }

  async batch(queries: Array<{ query: string; bindings?: any[] }>) {
    const statements = queries.map((q) =>
      this.db.prepare(q.query).bind(...(q.bindings || []))
    )
    const results = await this.db.batch(statements)
    return results
  }

  async transaction<T>(callback: (db: D1Database) => Promise<T>): Promise<T> {
    await this.db.prepare('BEGIN').run()
    try {
      const result = await callback(this.db)
      await this.db.prepare('COMMIT').run()
      return result
    } catch (error) {
      await this.db.prepare('ROLLBACK').run()
      throw error
    }
  }
}

export function createDB(): D1Database {
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare')
    const { env } = getCloudflareContext()
    if (env.D1_DATABASE) {
      return env.D1_DATABASE as unknown as D1Database
    }
  } catch {}

  const db = (globalThis as any).__D1_DATABASE__
  if (!db) {
    throw new Error(
      'D1 database not found. Make sure you are running with wrangler dev or the D1 binding is properly configured.'
    )
  }
  return db
}
