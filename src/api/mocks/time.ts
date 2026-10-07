/**
 * time.ts
 * Builds mock timestamps relative to the device clock. The fixtures were written for "today" =
 * Monday 5 October 2026; each time keeps its offset from that day, so "Today", "Yesterday" and the
 * list times look like the designs on any day.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * A UTC ISO time a number of days before today, at a local clock time.
 * @param daysAgo 0 for today, 1 for yesterday, and so on.
 * @param clock Local time as "HH:mm".
 * @param now The current time (default: the device clock).
 * @returns The time as UTC ISO 8601.
 */
export function mockTime(daysAgo: number, clock: string, now: Date = new Date()): string {
  const [hours, minutes] = clock.split(":").map(Number);
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
  return new Date(date.getTime() - daysAgo * MS_PER_DAY).toISOString();
}
