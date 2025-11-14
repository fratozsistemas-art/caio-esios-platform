// Development Tools & Utilities

class DevTools {
  constructor() {
    this.enabled = import.meta.env.DEV;
    this.logs = [];
    this.timers = new Map();
  }

  // Enhanced console logging with context
  log(category, message, data = {}) {
    if (!this.enabled) return;

    const log = {
      timestamp: new Date().toISOString(),
      category,
      message,
      data
    };

    this.logs.push(log);

    const emoji = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      success: '✅',
      performance: '⚡',
      api: '🌐',
      user: '👤',
      analytics: '📊'
    }[category] || '📝';

    console.log(
      `${emoji} [${category.toUpperCase()}]`,
      message,
      Object.keys(data).length > 0 ? data : ''
    );
  }

  // Performance timing
  startTimer(label) {
    this.timers.set(label, performance.now());
  }

  endTimer(label) {
    const start = this.timers.get(label);
    if (!start) {
      console.warn(`Timer "${label}" not found`);
      return;
    }

    const duration = performance.now() - start;
    this.timers.delete(label);

    this.log('performance', `${label} completed`, {
      duration: `${duration.toFixed(2)}ms`,
      fast: duration < 100,
      slow: duration > 1000
    });

    return duration;
  }

  // Component render tracking
  trackRender(componentName, props = {}) {
    if (!this.enabled) return;

    this.log('info', `${componentName} rendered`, {
      props: Object.keys(props),
      propsCount: Object.keys(props).length
    });
  }

  // API call tracking
  trackAPI(method, endpoint, duration, status) {
    this.log('api', `${method} ${endpoint}`, {
      duration: `${duration}ms`,
      status,
      success: status >= 200 && status < 300
    });
  }

  // Get logs
  getLogs(filter = null) {
    if (!filter) return this.logs;
    return this.logs.filter(log => log.category === filter);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs as JSON
  exportLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `caio-logs-${Date.now()}.json`;
    link.click();
  }

  // React DevTools integration
  highlightUpdates(enable = true) {
    if (typeof window === 'undefined') return;
    
    if (enable) {
      // Enable React DevTools highlight updates
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('✅ React DevTools detected');
      } else {
        console.log('⚠️ React DevTools not installed');
      }
    }
  }

  // Performance budget checker
  checkPerformanceBudget(metrics) {
    const budgets = {
      fcp: 1800, // First Contentful Paint
      lcp: 2500, // Largest Contentful Paint
      fid: 100, // First Input Delay
      cls: 0.1, // Cumulative Layout Shift
      ttfb: 800 // Time to First Byte
    };

    const violations = [];

    for (const [metric, value] of Object.entries(metrics)) {
      if (budgets[metric] && value > budgets[metric]) {
        violations.push({
          metric,
          value,
          budget: budgets[metric],
          exceeded: value - budgets[metric]
        });
      }
    }

    if (violations.length > 0) {
      console.warn('⚠️ Performance budget violations:', violations);
    }

    return violations;
  }

  // Bundle size analyzer
  analyzeBundleSize() {
    if (typeof window === 'undefined' || !window.performance) return;

    const resources = performance.getEntriesByType('resource');
    const js = resources.filter(r => r.name.endsWith('.js'));
    const css = resources.filter(r => r.name.endsWith('.css'));
    const images = resources.filter(r => /\.(png|jpg|jpeg|gif|webp|svg)/.test(r.name));

    const analysis = {
      javascript: {
        count: js.length,
        totalSize: js.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        largest: js.sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))[0]
      },
      css: {
        count: css.length,
        totalSize: css.reduce((sum, r) => sum + (r.transferSize || 0), 0)
      },
      images: {
        count: images.length,
        totalSize: images.reduce((sum, r) => sum + (r.transferSize || 0), 0)
      }
    };

    console.group('📦 Bundle Analysis');
    console.table({
      JavaScript: `${(analysis.javascript.totalSize / 1024).toFixed(2)} KB (${analysis.javascript.count} files)`,
      CSS: `${(analysis.css.totalSize / 1024).toFixed(2)} KB (${analysis.css.count} files)`,
      Images: `${(analysis.images.totalSize / 1024).toFixed(2)} KB (${analysis.images.count} files)`
    });
    console.groupEnd();

    return analysis;
  }

  // Memory leak detector
  detectMemoryLeaks() {
    if (typeof window === 'undefined' || !window.performance.memory) {
      console.warn('Memory API not available');
      return;
    }

    const memory = window.performance.memory;
    const used = (memory.usedJSHeapSize / 1048576).toFixed(2);
    const total = (memory.totalJSHeapSize / 1048576).toFixed(2);
    const limit = (memory.jsHeapSizeLimit / 1048576).toFixed(2);

    console.log(`💾 Memory: ${used}MB / ${total}MB (Limit: ${limit}MB)`);

    if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
      console.warn('⚠️ High memory usage detected!');
    }

    return { used, total, limit };
  }
}

// Singleton instance
export const devTools = new DevTools();

// Make available globally in dev
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.devTools = devTools;
  console.log('🛠️ DevTools available via window.devTools');
}

export default devTools;