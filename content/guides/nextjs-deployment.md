---
title: "Деплой Next.js на Cloudflare Workers"
description: "Пошаговая инструкция по деплою Next.js приложения на Cloudflare"
tags: ["nextjs", "cloudflare", "deployment", "workers"]
difficulty: "hard"
language: "typescript"
author: "markdown-platform"
created_at: "2026-07-21"
---

# Деплой Next.js на Cloudflare Workers

## Архитектура

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Browser   │────▶│ Cloudflare CDN   │────▶│   Workers   │
└─────────────┘     └──────────────────┘     └──────┬──────┘
                                                     │
                                              ┌──────▼──────┐
                                              │   D1 (SQL)  │
                                              └─────────────┘
```

## Шаг 1: Установка

```bash
# Создайте проект
npx create-next-app@latest my-app --typescript --tailwind
cd my-app

# Установите Cloudflare adapter
npm install @opennextjs/cloudflare
npm install -D wrangler @cloudflare/workers-types
```

## Шаг 2: Конфигурация

### wrangler.jsonc

```jsonc
{
  "main": ".open-next/worker.js",
  "name": "my-app",
  "compatibility_date": "2024-12-30",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "d1_databases": [
    {
      "binding": "D1_DATABASE",
      "database_name": "my-db",
      "database_id": "your-database-id"
    }
  ]
}
```

### next.config.ts

```typescript
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

initOpenNextCloudflareForDev();

export default {
  // конфигурация
};
```

## Шаг 3: Доступ к D1

```typescript
// lib/db.ts
export function createDB() {
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const { env } = getCloudflareContext();
    if (env.D1_DATABASE) {
      return env.D1_DATABASE;
    }
  } catch {}

  throw new Error('D1 not found');
}
```

## Шаг 4: Деплой

```bash
# Локальная разработка
npm run dev

# Билд
npm run build

# Деплой
npx wrangler deploy
```

## Шаг 5: Миграции

```bash
# Создайте миграцию
npx wrangler d1 migrations apply my-db
```

## Ошибки и решения

| Ошибка | Решение |
|--------|---------|
| `D1 not found` | Проверьте `wrangler.jsonc` |
| `crypto not found` | Используйте Web Crypto API |
| `nodejs_compat` | Добавьте флаг в wrangler.jsonc |
| `Module not found` | Проверьте импорты |

## Ссылки

- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Documentation](https://developers.cloudflare.com/d1/)
