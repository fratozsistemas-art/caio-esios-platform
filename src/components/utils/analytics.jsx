// Analytics & User Behavior Tracking

class AnalyticsManager {
  constructor() {
    // Detect if in development mode
    const isDev = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.includes('preview'));
    
    this.enabled = !isDev;
    this.queue = [];
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    // Track page views
    this.trackPageView();

    // Track session duration
    this.startSessionTracking();

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        type: 'unhandledrejection'
      });
    });
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId) {
    this.userId = userId;
  }

  trackPageView(pageName = null) {
    const page = pageName || window.location.pathname;
    
    this.track('page_view', {
      page,
      referrer: document.referrer,
      title: document.title,
      url: window.location.href
    });
  }

  trackEvent(eventName, properties = {}) {
    this.track('event', {
      event_name: eventName,
      ...properties
    });
  }

  trackClick(elementName, properties = {}) {
    this.trackEvent('click', {
      element: elementName,
      ...properties
    });
  }

  trackFormSubmit(formName, properties = {}) {
    this.trackEvent('form_submit', {
      form: formName,
      ...properties
    });
  }

  trackSearch(query, results = null) {
    this.trackEvent('search', {
      query,
      results_count: results
    });
  }

  trackError(error) {
    this.track('error', {
      error_message: error.message,
      error_type: error.type || 'runtime',
      error_stack: error.stack,
      page: window.location.pathname
    });
  }

  trackPerformance(metric, value) {
    this.track('performance', {
      metric,
      value,
      page: window.location.pathname
    });
  }

  trackUserAction(action, properties = {}) {
    this.trackEvent('user_action', {
      action,
      ...properties
    });
  }

  track(eventType, properties = {}) {
    const event = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.userId,
      properties: {
        ...properties,
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    this.queue.push(event);

    if (this.enabled) {
      this.sendToBackend(event);
    } else {
      console.log('📊 Analytics Event:', event);
    }
  }

  async sendToBackend(event) {
    // Future: Send to analytics backend (PostHog, Mixpanel, custom)
    try {
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  startSessionTracking() {
    this.sessionStart = Date.now();

    window.addEventListener('beforeunload', () => {
      const duration = Date.now() - this.sessionStart;
      this.track('session_end', {
        duration_ms: duration,
        duration_formatted: this.formatDuration(duration)
      });
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden', {});
      } else {
        this.track('page_visible', {});
      }
    });
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  getSessionData() {
    return {
      session_id: this.sessionId,
      user_id: this.userId,
      events_count: this.queue.length,
      session_duration: Date.now() - this.sessionStart
    };
  }

  clearQueue() {
    this.queue = [];
  }
}

// Singleton instance
export const analytics = new AnalyticsManager();

// Convenience methods
export const trackPageView = (page) => analytics.trackPageView(page);
export const trackEvent = (name, props) => analytics.trackEvent(name, props);
export const trackClick = (element, props) => analytics.trackClick(element, props);
export const trackError = (error) => analytics.trackError(error);
export const trackPerformance = (metric, value) => analytics.trackPerformance(metric, value);
export const trackUserAction = (action, props) => analytics.trackUserAction(action, props);

// Make available globally
if (typeof window !== 'undefined') {
  window.analytics = analytics;
}

export default analytics;