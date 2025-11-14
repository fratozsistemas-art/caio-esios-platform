// Performance Monitoring Utilities

class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.observers = [];
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.logMetric('long-task', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        // LongTask API not supported
      }

      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.logMetric('lcp', {
            value: lastEntry.renderTime || lastEntry.loadTime,
            element: lastEntry.element?.tagName
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        // LCP not supported
      }

      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.logMetric('fid', {
              value: entry.processingStart - entry.startTime,
              name: entry.name
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        // FID not supported
      }
    }

    window.addEventListener('load', () => {
      setTimeout(() => this.logCoreWebVitals(), 0);
    });
  }

  logMetric(name, data) {
    const metric = {
      name,
      timestamp: Date.now(),
      ...data
    };
    
    this.metrics.push(metric);
    
    // Log in development (check for localhost/preview)
    const isDev = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.includes('preview'));

    if (isDev) {
      console.log('PerformanceMetric:', metric);
    }
  }

  logCoreWebVitals() {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.logMetric('navigation', {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive,
        domComplete: navigation.domComplete,
        loadComplete: navigation.loadEventEnd
      });
    }

    const paint = performance.getEntriesByType('paint');
    paint.forEach(entry => {
      this.logMetric(entry.name, { value: entry.startTime });
    });
  }

  measureComponent(componentName, fn) {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    this.logMetric('component-render', {
      component: componentName,
      duration
    });
    
    return result;
  }

  getMetrics() {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

if (typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor;
}

export default performanceMonitor;