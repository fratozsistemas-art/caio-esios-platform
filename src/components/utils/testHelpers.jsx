/**
 * Test Helpers & Utilities
 * Helper functions for testing components and features
 */

/**
 * Create mock user
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'user',
    created_date: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Create mock strategy
 */
export function createMockStrategy(overrides = {}) {
  return {
    id: `strategy-${Date.now()}`,
    title: 'Test Strategy',
    category: 'ABRA',
    status: 'validated',
    roi_estimate: 25,
    priority: 'high',
    created_date: new Date().toISOString(),
    created_by: 'test@example.com',
    ...overrides
  };
}

/**
 * Create mock analysis
 */
export function createMockAnalysis(overrides = {}) {
  return {
    id: `analysis-${Date.now()}`,
    title: 'Test Analysis',
    type: 'market',
    status: 'completed',
    confidence_score: 85,
    created_date: new Date().toISOString(),
    created_by: 'test@example.com',
    ...overrides
  };
}

/**
 * Wait for condition
 */
export async function waitFor(condition, timeout = 5000, interval = 100) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Mock API response
 */
export function mockAPIResponse(data, delay = 100) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

/**
 * Simulate user interaction
 */
export function simulateClick(element) {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(event);
}

/**
 * Simulate form input
 */
export function simulateInput(element, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  ).set;
  
  nativeInputValueSetter.call(element, value);
  
  const event = new Event('input', { bubbles: true });
  element.dispatchEvent(event);
}

/**
 * Get element by test ID
 */
export function getByTestId(testId) {
  return document.querySelector(`[data-testid="${testId}"]`);
}

/**
 * Assert element exists
 */
export function assertExists(element, message = 'Element should exist') {
  if (!element) {
    throw new Error(message);
  }
}

/**
 * Assert element text
 */
export function assertText(element, expectedText, message = 'Text should match') {
  const actualText = element.textContent || element.innerText;
  if (actualText !== expectedText) {
    throw new Error(`${message}. Expected: "${expectedText}", Actual: "${actualText}"`);
  }
}

/**
 * Assert element has class
 */
export function assertHasClass(element, className, message = 'Element should have class') {
  if (!element.classList.contains(className)) {
    throw new Error(`${message}: ${className}`);
  }
}

/**
 * Performance test wrapper
 */
export async function measurePerformance(fn, label = 'Operation') {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
  
  return {
    result,
    duration
  };
}

/**
 * Batch test runner
 */
export async function runTests(tests, options = {}) {
  const {
    stopOnFailure = false,
    verbose = true
  } = options;

  const results = {
    total: tests.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
  };

  for (const test of tests) {
    const testResult = {
      name: test.name,
      status: 'pending'
    };

    try {
      if (test.skip) {
        testResult.status = 'skipped';
        results.skipped++;
        
        if (verbose) {
          console.log(`⏭️ SKIPPED: ${test.name}`);
        }
      } else {
        await test.fn();
        testResult.status = 'passed';
        results.passed++;
        
        if (verbose) {
          console.log(`✅ PASSED: ${test.name}`);
        }
      }
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
      results.failed++;
      
      if (verbose) {
        console.error(`❌ FAILED: ${test.name}`, error);
      }
      
      if (stopOnFailure) {
        break;
      }
    }

    results.tests.push(testResult);
  }

  return results;
}

export default {
  createMockUser,
  createMockStrategy,
  createMockAnalysis,
  waitFor,
  mockAPIResponse,
  simulateClick,
  simulateInput,
  getByTestId,
  assertExists,
  assertText,
  assertHasClass,
  measurePerformance,
  runTests
};