import { MemoryCache, withCache } from '@/lib/cache/memory';

describe('MemoryCache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache(1000); // 1 second TTL for tests
  });

  afterEach(() => {
    cache.clear();
  });

  it('stores and retrieves values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns null for missing keys', () => {
    expect(cache.get('missing')).toBeNull();
  });

  it('respects TTL', async () => {
    cache.set('key1', 'value1', 50); // 50ms TTL
    expect(cache.get('key1')).toBe('value1');

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(cache.get('key1')).toBeNull();
  });

  it('deletes entries', () => {
    cache.set('key1', 'value1');
    cache.delete('key1');
    expect(cache.get('key1')).toBeNull();
  });

  it('deletes by pattern', () => {
    cache.set('user:1', 'data1');
    cache.set('user:2', 'data2');
    cache.set('post:1', 'data3');

    cache.deletePattern('user:*');
    expect(cache.get('user:1')).toBeNull();
    expect(cache.get('user:2')).toBeNull();
    expect(cache.get('post:1')).toBe('data3');
  });

  it('clears all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('tracks size', () => {
    expect(cache.size).toBe(0);
    cache.set('key1', 'value1');
    expect(cache.size).toBe(1);
    cache.set('key2', 'value2');
    expect(cache.size).toBe(2);
  });
});

describe('withCache', () => {
  it('caches fetcher results', async () => {
    const cache = new MemoryCache(1000);
    let callCount = 0;

    const fetcher = async () => {
      callCount++;
      return 'data';
    };

    const result1 = await withCache('key', fetcher, 1000);
    const result2 = await withCache('key', fetcher, 1000);

    expect(result1).toBe('data');
    expect(result2).toBe('data');
    expect(callCount).toBe(1); // Fetcher called only once
  });
});
