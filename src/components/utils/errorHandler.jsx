// Global Error Handler Utility

class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.listeners = [];
  }

  logError(error, errorInfo = {}, context = {}) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message || error.toString(),
      stack: error.stack,
      errorInfo,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    this.errors.push(errorLog);
    
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    this.listeners.forEach(listener => listener(errorLog));

    // Log in development (check for localhost/preview)
    const isDev = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.includes('preview'));

    if (isDev) {
      console.error('ErrorHandler:', errorLog);
    }

    this.sendToMonitoring(errorLog);
  }

  sendToMonitoring(errorLog) {
    // Future: Sentry, LogRocket integration
  }

  getErrors() {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const errorHandler = new ErrorHandler();

if (typeof window !== 'undefined') {
  window.errorLogger = errorHandler;

  window.addEventListener('error', (event) => {
    errorHandler.logError(event.error || new Error(event.message), {}, {
      type: 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.logError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      {},
      { type: 'unhandledrejection' }
    );
  });
}

export default errorHandler;