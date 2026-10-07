/**
 * groupMessages.ts
 * Conversation logic: ordering, paging, pending sends, and turning messages into the rows of an
 * inverted list with day dividers, groups and "Seen" (design.md 3.15).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { isSameDay } from "date-fns";

import type { Message } from "../api/types";
import { MESSAGE_GROUP_GAP_MS } from "../constants/limits";
import { formatBubbleTime, formatDayDivider } from "./format";

/** A message on screen: a server message, or one being sent (clientId set). */
export interface ChatMessage extends Message {
  /** Set while the message only exists on the phone. */
  clientId?: string;
  /** "pending" while sending, "failed" when the send failed. */
  sendState?: "pending" | "failed";
}

/** A row in the conversation list. */
export type ChatRow =
  | { kind: "divider"; key: string; label: string }
  | {
      kind: "message";
      key: string;
      message: ChatMessage;
      isMine: boolean;
      /** Last bubble of its group: shows the time and, for their messages, the avatar. */
      isGroupEnd: boolean;
      /** First bubble of its group: gets the larger gap above it. */
      isGroupStart: boolean;
      /** "10:01" or "10:01 · Seen" on a group end; "" otherwise. */
      timeLabel: string;
    };

/**
 * Orders messages newest first. Messages with the same time keep the order they came in.
 * @param messages Messages in server order (newest first).
 * @returns A new list, newest first.
 */
export function orderMessages<T extends Message>(messages: readonly T[]): T[] {
  return [...messages].sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt));
}

/**
 * Merges an older page into the loaded messages.
 * @param loaded Messages already loaded, newest first.
 * @param older The next page from `before=`.
 * @returns Every message once, newest first.
 */
export function mergeOlderPages<T extends Message>(loaded: readonly T[], older: readonly T[]): T[] {
  const seen = new Set(loaded.map((m) => m.messageId));
  return orderMessages([...loaded, ...older.filter((m) => !seen.has(m.messageId))]);
}

/**
 * Settles a pending message after the server answers.
 * @param messages Messages on screen.
 * @param clientId The pending message's client ID.
 * @param sent The server's copy, or null when the send failed.
 * @returns The list with the pending entry replaced, or marked as failed.
 */
export function applySent(
  messages: readonly ChatMessage[],
  clientId: string,
  sent: Message | null,
): ChatMessage[] {
  if (sent === null) {
    return messages.map((m) => (m.clientId === clientId ? { ...m, sendState: "failed" } : m));
  }
  const withoutDuplicate = messages.filter((m) => m.messageId !== sent.messageId);
  return withoutDuplicate.map((m) => (m.clientId === clientId ? { ...sent } : m));
}

/**
 * Whether two neighbouring messages (oldest first) belong to the same group.
 * @param earlier The earlier message.
 * @param later The later message.
 * @returns True when the sender is the same, the day is the same and the gap is under 5 minutes.
 */
function isSameGroup(earlier: Message, later: Message): boolean {
  const gap = Date.parse(later.sentAt) - Date.parse(earlier.sentAt);
  return (
    earlier.senderId === later.senderId &&
    gap < MESSAGE_GROUP_GAP_MS &&
    isSameDay(new Date(earlier.sentAt), new Date(later.sentAt))
  );
}

/**
 * Turns messages into rows for an inverted list (the first row is drawn at the bottom).
 * @param messages Messages in any order.
 * @param myUserId The logged-in user's ID.
 * @param now The current time, for the day dividers (default: the device clock).
 * @returns Rows newest first: messages with grouping flags, and a divider above each day.
 */
export function groupMessages(
  messages: readonly ChatMessage[],
  myUserId: string,
  now: Date = new Date(),
): ChatRow[] {
  const oldestFirst = orderMessages(messages).reverse();
  const myLatest = [...oldestFirst].reverse().find((m) => m.senderId === myUserId && !m.sendState);
  const rows: ChatRow[] = [];
  oldestFirst.forEach((message, index) => {
    const previous = oldestFirst[index - 1];
    const next = oldestFirst[index + 1];
    if (previous === undefined || !isSameDay(new Date(previous.sentAt), new Date(message.sentAt))) {
      rows.push({
        kind: "divider",
        key: `day-${message.sentAt}`,
        label: formatDayDivider(message.sentAt, now),
      });
    }
    const isGroupEnd = next === undefined || !isSameGroup(message, next);
    const isSeen = message === myLatest && message.isRead;
    const time = formatBubbleTime(message.sentAt);
    rows.push({
      kind: "message",
      key: message.clientId ?? message.messageId,
      message,
      isMine: message.senderId === myUserId,
      isGroupEnd,
      isGroupStart: previous === undefined || !isSameGroup(previous, message),
      timeLabel: isGroupEnd ? (isSeen ? `${time} · Seen` : time) : "",
    });
  });
  return rows.reverse();
}
