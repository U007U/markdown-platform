---
title: "Шаблон документации API"
description: "Стандартный формат документации REST API"
tags: ["template", "api", "rest", "documentation"]
difficulty: "easy"
language: "universal"
author: "markdown-platform"
created_at: "2026-07-21"
---

# Шаблон документации API

## Структура

```markdown
# API Reference

## Базовый URL

```
https://api.example.com/v1
```

## Аутентификация

Все запросы требуют заголовок:

```
Authorization: Bearer <token>
```

---

## Endpoints

### GET /documents

Получить список документов.

**Параметры запроса:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|-------------|----------|
| page | number | Нет | Номер страницы (по умолчанию: 1) |
| limit | number | Нет | Количество (по умолчанию: 20) |
| search | string | Нет | Поиск по заголовку |

**Ответ (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "doc-1",
      "title": "Мой документ",
      "slug": "my-document",
      "content": "# Заголовок...",
      "created_at": "2026-07-21T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**Ошибки:**

| Код | Описание |
|-----|----------|
| 401 | Не авторизован |
| 500 | Серверная ошибка |

---

### POST /documents

Создать новый документ.

**Тело запроса:**

```json
{
  "title": "Новый документ",
  "content": "# Содержимое",
  "visibility": "public"
}
```

**Ответ (201):**

```json
{
  "success": true,
  "data": {
    "id": "doc-2",
    "title": "Новый документ",
    "slug": "novyy-dokument"
  }
}
```

---

### GET /documents/:id

Получить документ по ID.

**Параметры пути:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| id | string | ID документа или slug |

**Ответ (200):**

```json
{
  "success": true,
  "data": {
    "id": "doc-1",
    "title": "Документ",
    "content": "# Полное содержимое...",
    "author": {
      "id": "user-1",
      "username": "author"
    }
  }
}
```
```

## Формат ошибок

```json
{
  "success": false,
  "message": "Описание ошибки",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

| Endpoint | Лимит |
|----------|-------|
| GET | 100/мин |
| POST | 20/мин |
| DELETE | 10/мин |

Заголовки:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
```
