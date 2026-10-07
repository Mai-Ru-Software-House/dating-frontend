/**
 * age.ts
 * Age and date-of-birth helpers. Ages are counted on today's UTC date, the same rule the server
 * uses for `age` (design.md 5).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */

/** A calendar date with no time or time zone. */
export interface CalendarDate {
  year: number;
  month: number; // 1 to 12
  day: number;
}

/**
 * Parses a YYYY-MM-DD string into a real calendar date.
 * @param wire The date, for example "2006-11-08".
 * @returns The date, or null when the string is not a real date (for example 31 February).
 */
export function parseWireDate(wire: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(wire);
  if (match === null) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  const isReal =
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day;
  return isReal ? { year, month, day } : null;
}

/**
 * Formats a calendar date as YYYY-MM-DD.
 * @param date The date.
 * @returns The wire string.
 */
export function toWireDate(date: CalendarDate): string {
  const mm = String(date.month).padStart(2, "0");
  const dd = String(date.day).padStart(2, "0");
  return `${String(date.year).padStart(4, "0")}-${mm}-${dd}`;
}

/**
 * Today's date in UTC.
 * @param now The current time.
 * @returns The UTC calendar date of `now`.
 */
export function utcToday(now: Date): CalendarDate {
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, day: now.getUTCDate() };
}

/**
 * Compares two calendar dates.
 * @param a First date.
 * @param b Second date.
 * @returns A negative number if a is earlier, 0 if equal, positive if later.
 */
export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

/**
 * Whole years from a date of birth, counted on today's UTC date.
 * @param dob Date of birth as YYYY-MM-DD.
 * @param now The current time (default: the device clock).
 * @returns The age in whole years, or null when dob is not a real date.
 */
export function ageOn(dob: string, now: Date = new Date()): number | null {
  const birth = parseWireDate(dob);
  if (birth === null) {
    return null;
  }
  const today = utcToday(now);
  const hasHadBirthday =
    today.month > birth.month || (today.month === birth.month && today.day >= birth.day);
  return today.year - birth.year - (hasHadBirthday ? 0 : 1);
}

/**
 * The date a given number of years before today (UTC), for the date picker's default.
 * @param years Years back.
 * @param now The current time (default: the device clock).
 * @returns The date as YYYY-MM-DD.
 */
export function yearsAgo(years: number, now: Date = new Date()): string {
  const today = utcToday(now);
  const target = new Date(Date.UTC(today.year - years, today.month - 1, today.day));
  return toWireDate({
    year: target.getUTCFullYear(),
    month: target.getUTCMonth() + 1,
    day: target.getUTCDate(),
  });
}
