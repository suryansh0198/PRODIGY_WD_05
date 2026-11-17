export class SimpleCache {
  constructor(defaultTtlSeconds = 600) {
    this.defaultTtl = defaultTtlSeconds * 1000;
    this.store = new Map();
  }

  set(key, data, ttlSeconds) {
    const ttl = ttlSeconds !== undefined ? ttlSeconds * 1000 : this.defaultTtl;
    const expiresAt = Date.now() + ttl;
    this.store.set(key, { data, expiresAt });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key) {
    return this.get(key) !== null;
  }

  del(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  size() {
    this.prune();
    return this.store.size;
  }

  prune() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// Global default cache instance (10 minutes default TTL)
export const cache = new SimpleCache(600);
