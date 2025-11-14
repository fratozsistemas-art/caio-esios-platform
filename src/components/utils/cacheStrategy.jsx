/**
 * Advanced Caching Strategies
 * Implement different cache patterns for optimal performance
 */

class CacheManager {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.cache = new Map();
    this.accessCount = new Map();
    this.lastAccess = new Map();
  }

  /**
   * LRU (Least Recently Used) Cache
   */
  setLRU(key, value) {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.findLRUKey();
      this.cache.delete(oldestKey);
      this.accessCount.delete(oldestKey);
      this.lastAccess.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
    this.lastAccess.set(key, Date.now());
    this.accessCount.set(key, 0);
  }

  /**
   * LFU (Least Frequently Used) Cache
   */
  setLFU(key, value) {
    if (this.cache.size >= this.maxSize) {
      const leastUsedKey = this.findLFUKey();
      this.cache.delete(leastUsedKey);
      this.accessCount.delete(leastUsedKey);
      this.lastAccess.delete(leastUsedKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
    this.accessCount.set(key, 0);
  }

  /**
   * Get cached value
   */
  get(key) {
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check TTL
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      this.accessCount.delete(key);
      this.lastAccess.delete(key);
      return null;
    }

    // Update access metrics
    this.lastAccess.set(key, Date.now());
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);

    return cached.value;
  }

  /**
   * Find LRU key
   */
  findLRUKey() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, time] of this.lastAccess.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Find LFU key
   */
  findLFUKey() {
    let leastUsedKey = null;
    let leastCount = Infinity;

    for (const [key, count] of this.accessCount.entries()) {
      if (count < leastCount) {
        leastCount = count;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
    this.accessCount.clear();
    this.lastAccess.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate()
    };
  }

  calculateHitRate() {
    const totalAccess = Array.from(this.accessCount.values()).reduce((a, b) => a + b, 0);
    return totalAccess > 0 ? (this.cache.size / totalAccess) * 100 : 0;
  }
}

/**
 * Stale-While-Revalidate Cache
 */
export class SWRCache {
  constructor() {
    this.cache = new Map();
    this.revalidating = new Set();
  }

  async get(key, fetcher, options = {}) {
    const { revalidate = true, ttl = 60000 } = options;
    const cached = this.cache.get(key);

    // Return cached data immediately if available
    if (cached) {
      // Trigger background revalidation if stale
      if (revalidate && Date.now() - cached.timestamp > ttl && !this.revalidating.has(key)) {
        this.revalidateInBackground(key, fetcher);
      }

      return cached.data;
    }

    // Fetch fresh data
    const data = await fetcher();
    this.set(key, data);
    return data;
  }

  async revalidateInBackground(key, fetcher) {
    this.revalidating.add(key);

    try {
      const freshData = await fetcher();
      this.set(key, freshData);
    } catch (error) {
      console.error('Revalidation failed:', error);
    } finally {
      this.revalidating.delete(key);
    }
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  invalidate(key) {
    this.cache.delete(key);
  }
}

// Global instances
export const lruCache = new CacheManager({ maxSize: 100 });
export const swrCache = new SWRCache();

export default CacheManager;