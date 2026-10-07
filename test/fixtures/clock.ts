/**
 * clock.ts
 * The fixed "now" for every test: Tuesday 6 October 2026, 10:00 in Bangkok (the functional plan's
 * Test day, unit-test-plan.md 2.4).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */

export const NOW = new Date("2026-10-06T03:00:00Z");

/**
 * Fakes only Date, so "now" is NOW while timers stay real (screens that read the clock).
 * Undo with jest.useRealTimers().
 */
export function freezeToday(): void {
  jest.useFakeTimers({
    now: NOW,
    doNotFake: [
      "hrtime",
      "nextTick",
      "performance",
      "queueMicrotask",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "requestIdleCallback",
      "cancelIdleCallback",
      "setImmediate",
      "clearImmediate",
      "setInterval",
      "clearInterval",
      "setTimeout",
      "clearTimeout",
    ],
  });
}
