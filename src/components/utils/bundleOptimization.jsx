/**
 * Bundle Optimization Utilities
 * Tree-shaking helpers and code splitting strategies
 */

/**
 * Dynamic import with webpack magic comments
 */
export function dynamicImport(modulePath, chunkName) {
  return import(
    /* webpackChunkName: "[request]" */
    /* webpackMode: "lazy" */
    /* webpackPrefetch: true */
    modulePath
  );
}

/**
 * Chunked loading for large datasets
 */
export function* chunkArray(array, chunkSize) {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}

/**
 * Load data in chunks for better performance
 */
export async function loadInChunks(data, chunkSize, processor) {
  const chunks = Array.from(chunkArray(data, chunkSize));
  const results = [];

  for (const chunk of chunks) {
    const processed = await processor(chunk);
    results.push(...processed);
    
    // Allow UI to breathe between chunks
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return results;
}

/**
 * Debounced function for performance
 */
export function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttled function for performance
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Intersection Observer for lazy loading elements
 */
export function createIntersectionObserver(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
}

/**
 * Virtual scrolling helper
 */
export function calculateVisibleRange(
  scrollTop,
  viewportHeight,
  itemHeight,
  itemCount,
  overscan = 5
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan
  );

  return { startIndex, endIndex };
}

/**
 * Memoize expensive calculations
 */
export function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Request Animation Frame helper
 */
export function rafThrottle(callback) {
  let rafId = null;

  return function(...args) {
    if (rafId !== null) {
      return;
    }

    rafId = requestAnimationFrame(() => {
      callback.apply(this, args);
      rafId = null;
    });
  };
}

export default {
  dynamicImport,
  chunkArray,
  loadInChunks,
  debounce,
  throttle,
  createIntersectionObserver,
  calculateVisibleRange,
  memoize,
  rafThrottle
};