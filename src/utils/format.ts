/**
 * format.ts
 * Display formatting rules from design.md 5. The server sends UTC ISO 8601; times are converted to
 * the device's time zone only here, for display. Functions that need the date take `now`.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { differenceInCalendarDays, format, isSameYear } from "date-fns";

import { UNREAD_BADGE_MAX, WEEKDAY_WINDOW_DAYS } from "../constants/limits";
import { targetGendersToLabel } from "../constants/profile";
import { parseWireDate, toWireDate } from "./age";

/** Preferences as the API sends them (only the fields this file needs). */
export interface LookingFor {
  minAge: number;
  maxAge: number;
  targetGenders: readonly string[];
  radiusKm: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Time on list rows: today HH:mm, the last 6 days a weekday, then D MMM, then D MMM YYYY.
 * @param iso UTC ISO 8601 time.
 * @param now The current time (default: the device clock).
 * @returns For example "10:03", "Sun", "2 Oct" or "2 Oct 2025".
 */
export function formatListTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const daysAgo = differenceInCalendarDays(now, date);
  if (daysAgo <= 0) {
    return daysAgo === 0 ? format(date, "HH:mm") : format(date, "d MMM");
  }
  if (daysAgo <= WEEKDAY_WINDOW_DAYS) {
    return format(date, "EEE");
  }
  return isSameYear(date, now) ? format(date, "d MMM") : format(date, "d MMM yyyy");
}

/**
 * Time under a chat bubble.
 * @param iso UTC ISO 8601 time.
 * @returns Local 24 h time, for example "09:48".
 */
export function formatBubbleTime(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

/**
 * Day divider in a conversation.
 * @param iso UTC ISO 8601 time.
 * @param now The current time (default: the device clock).
 * @returns "Today", "Yesterday", or for example "Fri 2 Oct".
 */
export function formatDayDivider(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const daysAgo = differenceInCalendarDays(now, date);
  if (daysAgo === 0) {
    return "Today";
  }
  if (daysAgo === 1) {
    return "Yesterday";
  }
  return format(date, "EEE d MMM");
}

/**
 * A note's timestamp: its last change (updatedAt if set, else createdAt).
 * @param note The note's createdAt and optional updatedAt.
 * @param now The current time (default: the device clock).
 * @returns "Today, 09:55", "Yesterday, 21:10" or "3 Oct, 14:27".
 */
export function formatNoteTime(
  note: { createdAt: string; updatedAt?: string | null },
  now: Date = new Date(),
): string {
  const date = new Date(note.updatedAt ?? note.createdAt);
  const daysAgo = differenceInCalendarDays(now, date);
  const time = format(date, "HH:mm");
  if (daysAgo === 0) {
    return `Today, ${time}`;
  }
  if (daysAgo === 1) {
    return `Yesterday, ${time}`;
  }
  return `${format(date, "d MMM")}, ${time}`;
}

/**
 * The date line on Home.
 * @param now The current time (default: the device clock).
 * @returns For example "Monday, 5 October".
 */
export function formatHomeDate(now: Date = new Date()): string {
  return format(now, "EEEE, d MMMM");
}

/**
 * Name and age.
 * @param displayName The person's display name.
 * @param age Age in years.
 * @returns For example "Fern, 19".
 */
export function formatNameAge(displayName: string, age: number): string {
  return `${displayName}, ${age}`;
}

/**
 * Distance text, never below 1 km.
 * @param distanceKm Whole km from the API.
 * @param style "card" for cards and profiles, "row" for list rows.
 * @returns "6 km away" (card) or "6 km" (row).
 */
export function formatDistance(distanceKm: number, style: "card" | "row"): string {
  const km = Math.max(1, Math.round(distanceKm));
  return style === "card" ? `${km} km away` : `${km} km`;
}

/**
 * Unread badge text.
 * @param count Number of unread items.
 * @returns null for no badge, "1" to "9", or "9+".
 */
export function formatUnreadCount(count: number): string | null {
  if (count <= 0) {
    return null;
  }
  return count > UNREAD_BADGE_MAX ? `${UNREAD_BADGE_MAX}+` : String(count);
}

/**
 * Last message preview on the chat list.
 * @param lastMessage The message's sender and text.
 * @param myUserId The logged-in user's ID.
 * @returns The text, prefixed with "You: " when I sent it.
 */
export function formatPreview(
  lastMessage: { senderId: string; text: string },
  myUserId: string,
): string {
  return lastMessage.senderId === myUserId ? `You: ${lastMessage.text}` : lastMessage.text;
}

/**
 * Converts the date of birth input to the wire format.
 * @param display For example "08 / 11 / 2006".
 * @returns "2006-11-08", or null when it is not a real date.
 */
export function dobToWire(display: string): string | null {
  const match = /^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/.exec(display.trim());
  if (match === null) {
    return null;
  }
  const wire = toWireDate({
    year: Number(match[3]),
    month: Number(match[2]),
    day: Number(match[1]),
  });
  return parseWireDate(wire) === null ? null : wire;
}

/**
 * Converts a wire date of birth to the input format.
 * @param wire For example "2006-11-08".
 * @returns "08 / 11 / 2006", or null when it is not a real date.
 */
export function dobFromWire(wire: string): string | null {
  const date = parseWireDate(wire);
  if (date === null) {
    return null;
  }
  const dd = String(date.day).padStart(2, "0");
  const mm = String(date.month).padStart(2, "0");
  return `${dd} / ${mm} / ${date.year}`;
}

/**
 * Date of birth for display.
 * @param wire For example "2006-11-08".
 * @returns "8 Nov 2006", or "" when it is not a real date.
 */
export function formatDob(wire: string): string {
  const date = parseWireDate(wire);
  return date === null ? "" : `${date.day} ${MONTHS[date.month - 1]} ${date.year}`;
}

/**
 * Subtitle of the Home Matches tile.
 * @param count People in the first recommendations page.
 * @param pageLimit The page size asked for.
 * @returns "No matches yet", "1 person", "7 people" or "10+ people".
 */
export function formatMatchesTile(count: number, pageLimit: number): string {
  if (count <= 0) {
    return "No matches yet";
  }
  if (count >= pageLimit) {
    return `${pageLimit}+ people`;
  }
  return count === 1 ? "1 person" : `${count} people`;
}

/**
 * Subtitle of the Home Chats tile.
 * @param senders Conversations with unread messages.
 * @returns "3 unread" or "No new messages".
 */
export function formatChatsTile(senders: number): string {
  return senders > 0 ? `${senders} unread` : "No new messages";
}

/**
 * Header of the search results.
 * @param count Results returned.
 * @param limit The limit asked for.
 * @returns "1 PERSON FOUND", "7 PEOPLE FOUND" or "20+ PEOPLE FOUND".
 */
export function formatFoundCount(count: number, limit: number): string {
  if (count === 1) {
    return "1 PERSON FOUND";
  }
  return count >= limit ? `${count}+ PEOPLE FOUND` : `${count} PEOPLE FOUND`;
}

/**
 * The "Looking for" line.
 * @param prefs Target genders, age range and radius.
 * @returns For example "Men · 19 – 25 · within 20 km".
 */
export function formatLookingFor(prefs: LookingFor): string {
  const genders = targetGendersToLabel(prefs.targetGenders);
  return `${genders} · ${prefs.minAge} – ${prefs.maxAge} · within ${prefs.radiusKm} km`;
}

/**
 * Match score.
 * @param matchScore 0 to 100.
 * @returns For example "92%".
 */
export function formatScore(matchScore: number): string {
  return `${Math.round(matchScore)}%`;
}

/**
 * Note count on the Notes tab.
 * @param count Number of notes.
 * @returns "1 note" or "3 notes".
 */
export function formatNoteCount(count: number): string {
  return count === 1 ? "1 note" : `${count} notes`;
}

/**
 * Age range on a slider header.
 * @param min Lower age.
 * @param max Upper age.
 * @returns "18 – 20", or "18" when both are the same.
 */
export function formatAgeRange(min: number, max: number): string {
  return min === max ? String(min) : `${min} – ${max}`;
}

/**
 * First line of a text, for previews and cards.
 * @param text Any text.
 * @returns The text up to the first line break.
 */
export function firstLine(text: string): string {
  const trimmed = text.trim();
  const breakAt = trimmed.indexOf("\n");
  return breakAt === -1 ? trimmed : trimmed.slice(0, breakAt);
}

/**
 * Place and distance on a candidate row.
 * @param district The short place, or null when there is no place name.
 * @param distanceKm Whole km.
 * @returns "Min Buri · 6 km", or "6 km" without a place.
 */
export function formatRowPlace(district: string | null, distanceKm: number): string {
  const distance = formatDistance(distanceKm, "row");
  return district === null ? distance : `${district} · ${distance}`;
}
