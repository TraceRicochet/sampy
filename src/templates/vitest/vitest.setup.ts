// @ts-nocheck

import '@testing-library/jest-dom';
// Import vitest for its mocking functionality
import { vi, afterAll, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Silence React 19 ref warnings and other console noise
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalConsoleGroup = console.group;
const originalConsoleGroupEnd = console.groupEnd;
// Store original methods for restoration
const originalConsoleErrorRestore = console.error;
const originalConsoleLogRestore = console.log;
const originalConsoleGroupRestore = console.group;
const originalConsoleGroupEndRestore = console.groupEnd;

// Register afterAll hook at the top level
afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleErrorRestore;
  console.log = originalConsoleLogRestore;
  console.group = originalConsoleGroupRestore;
  console.groupEnd = originalConsoleGroupEndRestore;
});

// Mock console methods with proper typing
console.error = function (
  this: typeof console,
  ...args: Parameters<typeof console.error>
) {
  // Suppress PrimeReact CSS parsing errors and other console noise
  if (
    args[0]?.toString().includes('Could not parse CSS stylesheet') ||
    args[0]?.toString().includes('Warning: validateDOMNesting') ||
    args[0]?.toString().includes('primereact.css') ||
    args[0] === 'Toast instance not found:' ||
    args[0]
      ?.toString()
      .includes('Accessing element.ref was removed in React 19') ||
    args[0]?.toString().includes('inside a test was not wrapped in act')
  ) {
    return;
  }
  originalConsoleError.apply(this, args);
};

console.log = function (
  this: typeof console,
  ...args: Parameters<typeof console.log>
) {
  // Suppress validation logs
  if (args[0]?.toString().includes('Required')) {
    return;
  }
  originalConsoleLog.apply(this, args);
};

console.group = function (
  this: typeof console,
  ...args: Parameters<typeof console.group>
) {
  // Suppress act warnings
  if (args[0]?.toString().includes('Update')) {
    return;
  }
  originalConsoleGroup.apply(this, args);
};

console.groupEnd = function (
  this: typeof console,
  ...args: Parameters<typeof console.groupEnd>
) {
  originalConsoleGroupEnd.apply(this, args);
};

// Replace jest.fn() with vi.fn()
console.groupCollapsed = vi.fn();

// Mock next/navigation - replace jest.mock with vi.mock
vi.mock('next/navigation', () => {
  return {
    useRouter: () => {
      return {
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
      };
    },
    useSearchParams: () => {
      return {
        get: vi.fn(),
      };
    },
    usePathname: () => {
      return '';
    },
    notFound: vi.fn(),
  };
});

// Mock PrimeReact Toast
vi.mock('primereact/toast', () => {
  return {
    Toast: vi.fn().mockImplementation(() => ({
      show: vi.fn(),
    })),
  };
});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Run cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
