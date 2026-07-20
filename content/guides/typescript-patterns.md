---
title: "Паттерны TypeScript"
description: "Распространённые паттерны проектирования на TypeScript"
tags: ["typescript", "patterns", "architecture"]
difficulty: "medium"
language: "typescript"
author: "markdown-platform"
created_at: "2026-07-21"
---

# Паттерны TypeScript

## 1. Builder Pattern

```typescript
class QueryBuilder {
  private table: string = '';
  private conditions: string[] = [];
  private limitValue: number = 100;

  from(table: string): this {
    this.table = table;
    return this;
  }

  where(condition: string): this {
    this.conditions.push(condition);
    return this;
  }

  limit(n: number): this {
    this.limitValue = n;
    return this;
  }

  build(): string {
    let query = `SELECT * FROM ${this.table}`;
    if (this.conditions.length) {
      query += ` WHERE ${this.conditions.join(' AND ')}`;
    }
    query += ` LIMIT ${this.limitValue}`;
    return query;
  }
}

// Использование
const query = new QueryBuilder()
  .from('users')
  .where('role = "admin"')
  .where('email_verified = 1')
  .limit(10)
  .build();
```

## 2. Repository Pattern

```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

class UserRepository implements Repository<User> {
  constructor(private db: D1Database) {}

  async findById(id: string): Promise<User | null> {
    return this.db.prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first<User>();
  }

  async findAll(): Promise<User[]> {
    const result = await this.db.prepare('SELECT * FROM users')
      .all<User>();
    return result.results;
  }

  async create(data: Partial<User>): Promise<User> {
    const id = crypto.randomUUID();
    await this.db.prepare(
      'INSERT INTO users (id, email, username) VALUES (?, ?, ?)'
    ).bind(id, data.email, data.username).run();
    return this.findById(id) as Promise<User>;
  }

  // ... update, delete
}
```

## 3. Strategy Pattern

```typescript
interface SortStrategy<T> {
  sort(items: T[]): T[];
}

class SortByDate<T extends { created_at: string }> implements SortStrategy<T> {
  sort(items: T[]): T[] {
    return [...items].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
}

class SortByTitle<T extends { title: string }> implements SortStrategy<T> {
  sort(items: T[]): T[] {
    return [...items].sort((a, b) => a.title.localeCompare(b.title));
  }
}

class DocumentList {
  private strategy: SortStrategy<Document>;

  constructor(strategy: SortStrategy<Document>) {
    this.strategy = strategy;
  }

  setStrategy(strategy: SortStrategy<Document>) {
    this.strategy = strategy;
  }

  sort(documents: Document[]): Document[] {
    return this.strategy.sort(documents);
  }
}
```

## 4. Observer Pattern

```typescript
type EventHandler<T> = (data: T) => void;

class EventEmitter<Events extends Record<string, unknown>> {
  private handlers = new Map<string, Set<EventHandler<any>>>();

  on<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>
  ): () => void {
    if (!this.handlers.has(event as string)) {
      this.handlers.set(event as string, new Set());
    }
    this.handlers.get(event as string)!.add(handler);

    return () => {
      this.handlers.get(event as string)?.delete(handler);
    };
  }

  emit<K extends keyof Events>(event: K, data: Events[K]) {
    this.handlers.get(event as string)?.forEach(handler => handler(data));
  }
}

// Использование
interface AppEvents {
  'user:created': { id: string; email: string };
  'document:published': { id: string; title: string };
}

const emitter = new EventEmitter<AppEvents>();

emitter.on('user:created', (data) => {
  console.log(`User created: ${data.email}`);
});
```

## Выбор паттерна

| Задача | Паттерн |
|--------|---------|
| Сложные запросы | Builder |
| Работа с БД | Repository |
| Разные алгоритмы | Strategy |
| Уведомления | Observer |
| Один объект | Singleton |
| Фабрика объектов | Factory |
