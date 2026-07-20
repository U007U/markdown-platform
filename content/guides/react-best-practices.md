---
title: "Лучшие практики React"
description: "Инструкция по написанию качественного React-кода"
tags: ["react", "best-practices", "frontend"]
difficulty: "medium"
language: "typescript"
author: "markdown-platform"
created_at: "2026-07-21"
---

# Лучшие практики React

## Архитектура компонентов

### 1. Разделяй компоненты

```tsx
// ❌ Плохо: один монолитный компонент
function UserPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  // ... 200 строк кода
}

// ✅ Хорошо: раздельные компоненты
function UserPage({ userId }) {
  return (
    <Layout>
      <UserProfile userId={userId} />
      <UserPosts userId={userId} />
      <UserComments userId={userId} />
    </Layout>
  );
}
```

### 2. Используй Server Components

```tsx
// ✅ Server Component (по умолчанию)
async function DocumentPage({ params }) {
  const doc = await getDocument(params.slug);
  return <DocumentViewer doc={doc} />;
}

// ✅ Client Component (только когда нужна интерактивность)
'use client'
function SearchBar() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={...} />;
}
```

### 3. Custom Hooks для логики

```tsx
// ❌ Плохо: логика в компоненте
function UserProfile() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch(`/api/users/${id}`).then(r => r.json()).then(setUser);
  }, [id]);
  // ...
}

// ✅ Хорошо: хук
function useUser(id) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch(`/api/users/${id}`).then(r => r.json()).then(setUser);
  }, [id]);
  return user;
}

function UserProfile({ id }) {
  const user = useUser(id);
  if (!user) return <Loading />;
  return <div>{user.name}</div>;
}
```

## Производительность

### Мемоизация

```tsx
// useMemo для дорогих вычислений
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.date - b.date);
}, [items]);

// useCallback для функций, передаваемых в дочерние компоненты
const handleClick = useCallback((id) => {
  setSelected(id);
}, []);
```

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Типизация

```tsx
// Используй интерфейсы для пропсов
interface UserCardProps {
  user: User;
  onSelect: (id: string) => void;
  variant?: 'compact' | 'full';
}

function UserCard({ user, onSelect, variant = 'full' }: UserCardProps) {
  // ...
}
```

## Чеклист

- [ ] Компоненты < 200 строк
- [ ] Server Components по умолчанию
- [ ] Custom hooks для переиспользуемой логики
- [ ] TypeScript для всех пропсов
- [ ] useMemo/useCallback при необходимости
- [ ] Lazy loading для тяжёлых компонентов
