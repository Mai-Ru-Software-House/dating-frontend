/**
 * globalSetup.ts
 * Runs once before the test workers start: every test sees Bangkok time on any computer.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */

/**
 * Sets the time zone for all test workers.
 */
export default function globalSetup(): void {
  process.env.TZ = "Asia/Bangkok";
}
