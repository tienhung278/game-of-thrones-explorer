type CacheEntry<T> = { data: T; expiresAt: number };

const cache = new Map<string, CacheEntry<any>>();

export function setCache<T>(key: string, data: T, ttlMs = 60_000): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function getCache<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

export function clearCache(key?: string): void {
  if (key) cache.delete(key);
  else cache.clear();
}
