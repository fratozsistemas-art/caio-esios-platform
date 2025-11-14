import React from 'react';

// Debugging Utilities

/**
 * Pretty print objects with colors
 */
export function prettyLog(label, data, color = '#3b82f6') {
  if (import.meta.env.PROD) return;

  console.log(
    `%c${label}`,
    `color: ${color}; font-weight: bold; font-size: 14px; padding: 4px 8px; background: ${color}20; border-radius: 4px;`,
    data
  );
}

/**
 * Assert with custom error messages
 */
export function assert(condition, message) {
  if (!condition) {
    const error = new Error(`Assertion failed: ${message}`);
    console.error(error);
    if (import.meta.env.DEV) {
      throw error;
    }
  }
}

/**
 * Type checking utilities
 */
export const TypeCheckers = {
  isString: (val) => typeof val === 'string',
  isNumber: (val) => typeof val === 'number' && !isNaN(val),
  isBoolean: (val) => typeof val === 'boolean',
  isObject: (val) => val !== null && typeof val === 'object' && !Array.isArray(val),
  isArray: (val) => Array.isArray(val),
  isFunction: (val) => typeof val === 'function',
  isNull: (val) => val === null,
  isUndefined: (val) => val === undefined,
  isNullOrUndefined: (val) => val === null || val === undefined,
  isEmpty: (val) => {
    if (TypeCheckers.isNullOrUndefined(val)) return true;
    if (TypeCheckers.isString(val) || TypeCheckers.isArray(val)) return val.length === 0;
    if (TypeCheckers.isObject(val)) return Object.keys(val).length === 0;
    return false;
  }
};

/**
 * Runtime type validation
 */
export function validateType(value, expectedType, varName = 'value') {
  const checker = TypeCheckers[`is${expectedType}`];
  if (!checker) {
    throw new Error(`Unknown type: ${expectedType}`);
  }

  if (!checker(value)) {
    const actualType = typeof value;
    throw new TypeError(
      `Expected ${varName} to be ${expectedType}, but got ${actualType}`
    );
  }

  return true;
}

/**
 * Validate object shape
 */
export function validateShape(obj, shape, objName = 'object') {
  assert(TypeCheckers.isObject(obj), `${objName} must be an object`);

  for (const [key, type] of Object.entries(shape)) {
    if (!(key in obj)) {
      throw new Error(`Missing required property: ${objName}.${key}`);
    }
    validateType(obj[key], type, `${objName}.${key}`);
  }

  return true;
}

/**
 * Performance profiler
 */
export class Profiler {
  constructor(name) {
    this.name = name;
    this.measurements = [];
  }

  start() {
    this.startTime = performance.now();
  }

  end() {
    if (!this.startTime) return;

    const duration = performance.now() - this.startTime;
    this.measurements.push(duration);
    
    prettyLog(
      `⚡ ${this.name}`,
      `${duration.toFixed(2)}ms`,
      duration < 16 ? '#22c55e' : duration < 100 ? '#f59e0b' : '#ef4444'
    );

    this.startTime = null;
    return duration;
  }

  getStats() {
    if (this.measurements.length === 0) return null;

    const sorted = [...this.measurements].sort((a, b) => a - b);
    return {
      count: this.measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: this.measurements.reduce((a, b) => a + b, 0) / this.measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  reset() {
    this.measurements = [];
  }
}

/**
 * React component debugger
 */
export function debugRender(componentName, props, reason) {
  if (import.meta.env.PROD) return;

  console.group(`🔄 ${componentName} re-rendered`);
  console.log('Props:', props);
  if (reason) console.log('Reason:', reason);
  console.trace();
  console.groupEnd();
}

/**
 * Memo with debug
 */
export function memoWithDebug(Component, propsAreEqual, componentName) {
  return React.memo(Component, (prevProps, nextProps) => {
    const areEqual = propsAreEqual ? propsAreEqual(prevProps, nextProps) : Object.is(prevProps, nextProps);
    
    if (!areEqual && import.meta.env.DEV) {
      const changedProps = Object.keys(nextProps).filter(
        key => !Object.is(prevProps[key], nextProps[key])
      );
      debugRender(componentName || Component.name, nextProps, `Props changed: ${changedProps.join(', ')}`);
    }

    return areEqual;
  });
}

/**
 * Network request logger
 */
export class NetworkLogger {
  constructor() {
    this.requests = [];
  }

  log(request) {
    const log = {
      timestamp: Date.now(),
      ...request
    };
    this.requests.push(log);

    if (import.meta.env.DEV) {
      const color = request.status >= 200 && request.status < 300 ? '#22c55e' : '#ef4444';
      prettyLog(
        `🌐 ${request.method} ${request.url}`,
        `${request.status} (${request.duration}ms)`,
        color
      );
    }
  }

  getStats() {
    return {
      total: this.requests.length,
      successful: this.requests.filter(r => r.status >= 200 && r.status < 300).length,
      failed: this.requests.filter(r => r.status >= 400).length,
      avgDuration: this.requests.reduce((sum, r) => sum + r.duration, 0) / this.requests.length
    };
  }

  clear() {
    this.requests = [];
  }
}

export const networkLogger = new NetworkLogger();

export default {
  prettyLog,
  assert,
  TypeCheckers,
  validateType,
  validateShape,
  Profiler,
  debugRender,
  memoWithDebug,
  networkLogger
};