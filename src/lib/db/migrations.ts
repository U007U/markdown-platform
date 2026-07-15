import { type D1Database } from '@cloudflare/workers-types'

export interface Migration {
  name: string
  up: (db: D1Database) => Promise<void>
  down?: (db: D1Database) => Promise<void>
}

export class MigrationManager {
  private dbName: string

  constructor(dbName: string) {
    this.dbName = dbName
  }

  async getMigrations(db: D1Database): Promise<string[]> {
    try {
      const results = await db
        .prepare('SELECT name FROM migrations ORDER BY name')
        .all()
      return results.results.map((row: any) => row.name)
    } catch (error) {
      return []
    }
  }

  async hasMigration(db: D1Database, name: string): Promise<boolean> {
    const migrations = await this.getMigrations(db)
    return migrations.includes(name)
  }

  async runMigration(
    db: D1Database,
    name: string,
    up: (db: D1Database) => Promise<void>
  ): Promise<void> {
    await db.prepare('BEGIN').run()
    try {
      await up(db)
      await db
        .prepare(
          'INSERT INTO migrations (name, run_at) VALUES (?, ?)'
        )
        .bind(name, new Date().toISOString())
        .run()
      await db.prepare('COMMIT').run()
    } catch (error) {
      await db.prepare('ROLLBACK').run()
      throw error
    }
  }

  async revertMigration(
    db: D1Database,
    name: string,
    down: (db: D1Database) => Promise<void>
  ): Promise<void> {
    await db.prepare('BEGIN').run()
    try {
      await down(db)
      await db
        .prepare('DELETE FROM migrations WHERE name = ?')
        .bind(name)
        .run()
      await db.prepare('COMMIT').run()
    } catch (error) {
      await db.prepare('ROLLBACK').run()
      throw error
    }
  }

  async up(db: D1Database, name: string, up: (db: D1Database) => Promise<void>) {
    if (await this.hasMigration(db, name)) {
      console.log(`Migration ${name} already applied`)
      return
    }
    console.log(`Running migration: ${name}`)
    await this.runMigration(db, name, up)
    console.log(`Migration ${name} completed`)
  }

  async down(
    db: D1Database,
    name: string,
    down: (db: D1Database) => Promise<void>
  ) {
    if (!(await this.hasMigration(db, name))) {
      console.log(`Migration ${name} not applied`)
      return
    }
    console.log(`Reverting migration: ${name}`)
    await this.revertMigration(db, name, down)
    console.log(`Migration ${name} reverted`)
  }
}

export function createMigrationManager(dbName: string): MigrationManager {
  return new MigrationManager(dbName)
}
