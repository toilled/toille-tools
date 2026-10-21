import { vi } from 'vitest';
import { cleanup } from '@solidjs/testing-library';

/**
 * Standard afterEach hook that cleans up renders, restores timers, and resets mocks.
 * Call this from test files: `afterEach(cleanupAfterEach)`.
 */
export function cleanupAfterEach() {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  if (typeof window !== 'undefined') {
    if (window.location?.hash) {
      window.location.hash = '';
    }
    try {
      window.localStorage?.clear();
    } catch {
      /* ignore */
    }
  }
}
