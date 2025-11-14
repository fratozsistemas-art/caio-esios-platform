/**
 * Security Utilities
 * Input sanitization, XSS prevention, CSRF protection
 */

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html) {
  if (!html) return '';

  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Escape HTML special characters
 */
export function escapeHTML(text) {
  if (!text) return '';

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return String(text).replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitize URL to prevent javascript: protocol
 */
export function sanitizeURL(url) {
  if (!url) return '';

  // Remove javascript:, data:, vbscript: protocols
  const dangerous = /^(javascript|data|vbscript):/i;
  
  if (dangerous.test(url)) {
    console.warn('⚠️ Dangerous URL blocked:', url);
    return '';
  }

  return url;
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store CSRF token
 */
export function storeCSRFToken(token) {
  sessionStorage.setItem('csrf_token', token);
}

/**
 * Get CSRF token
 */
export function getCSRFToken() {
  return sessionStorage.getItem('csrf_token');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token) {
  const storedToken = getCSRFToken();
  return storedToken === token;
}

/**
 * Content Security Policy helpers
 */
export const CSP = {
  /**
   * Generate nonce for inline scripts
   */
  generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array));
  },

  /**
   * Check if CSP is enabled
   */
  isEnabled() {
    return document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
  }
};

/**
 * Prevent clickjacking
 */
export function preventClickjacking() {
  if (window.self !== window.top) {
    console.warn('⚠️ Clickjacking attempt detected');
    // Optionally break out of frame
    // window.top.location = window.self.location;
  }
}

/**
 * Secure local storage wrapper
 */
export const secureStorage = {
  /**
   * Set item with encryption (basic obfuscation)
   */
  setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      const encoded = btoa(serialized);
      localStorage.setItem(key, encoded);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  /**
   * Get item with decryption
   */
  getItem(key) {
    try {
      const encoded = localStorage.getItem(key);
      if (!encoded) return null;
      
      const serialized = atob(encoded);
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  },

  /**
   * Remove item
   */
  removeItem(key) {
    localStorage.removeItem(key);
  },

  /**
   * Clear all
   */
  clear() {
    localStorage.clear();
  }
};

/**
 * Rate limiting helper (client-side)
 */
export class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Check if request is allowed
   */
  isAllowed() {
    const now = Date.now();
    
    // Remove old requests outside window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // Check if under limit
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }

  /**
   * Get remaining requests
   */
  getRemaining() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  /**
   * Reset limiter
   */
  reset() {
    this.requests = [];
  }
}

/**
 * Input validation utilities
 */
export const inputValidation = {
  /**
   * Validate string length
   */
  validateLength(str, min, max) {
    const len = str?.length || 0;
    return len >= min && len <= max;
  },

  /**
   * Validate number range
   */
  validateNumber(num, min, max) {
    return typeof num === 'number' && num >= min && num <= max;
  },

  /**
   * Validate enum value
   */
  validateEnum(value, allowedValues) {
    return allowedValues.includes(value);
  },

  /**
   * Validate required fields
   */
  validateRequired(obj, requiredFields) {
    return requiredFields.every(field => {
      const value = obj[field];
      return value !== null && value !== undefined && value !== '';
    });
  }
};

/**
 * Detect and prevent common attacks
 */
export const securityChecks = {
  /**
   * Check for SQL injection patterns
   */
  hasSQLInjection(input) {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(union.*select|insert.*into|update.*set|delete.*from)/gi,
      /(\-\-|\/\*|\*\/|;|'|")/g
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  },

  /**
   * Check for XSS patterns
   */
  hasXSS(input) {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  },

  /**
   * Check for path traversal
   */
  hasPathTraversal(input) {
    const pathPatterns = [
      /\.\.\//g,
      /\.\.%2[fF]/g,
      /%2[eE]%2[eE]%2[fF]/g
    ];

    return pathPatterns.some(pattern => pattern.test(input));
  },

  /**
   * Validate input against all checks
   */
  validateInput(input) {
    const checks = [
      { name: 'SQL Injection', check: this.hasSQLInjection(input) },
      { name: 'XSS', check: this.hasXSS(input) },
      { name: 'Path Traversal', check: this.hasPathTraversal(input) }
    ];

    const failed = checks.filter(c => c.check);

    if (failed.length > 0) {
      console.warn('⚠️ Security check failed:', failed.map(c => c.name).join(', '));
      return false;
    }

    return true;
  }
};

// Initialize security measures
if (typeof window !== 'undefined') {
  preventClickjacking();
}

export default {
  sanitizeHTML,
  escapeHTML,
  sanitizeURL,
  isValidEmail,
  isValidURL,
  generateCSRFToken,
  storeCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  CSP,
  secureStorage,
  RateLimiter,
  inputValidation,
  securityChecks
};