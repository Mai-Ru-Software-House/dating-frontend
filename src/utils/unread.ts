/**
 * unread.ts
 * Groups unread messages by sender for Home (api-integration.md 6.11). The number of senders is
 * also the Chats tile count and the Chats tab badge.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { UnreadMessage, UserSummary } from "../api/types";

/** One row on Home: a sender, their newest unread message and how many there are. */
export interface UnreadGroup {
  sender: UserSummary;
  count: number;
  newestText: string;
  newestSentAt: string;
  newestMessageId: string;
}

/**
 * Groups unread messages by sender.
 * @param messages Unread messages in any order.
 * @returns One group per sender, the newest group first.
 */
export function groupUnread(messages: readonly UnreadMessage[]): UnreadGroup[] {
  const groups = new Map<string, UnreadGroup>();
  for (const message of messages) {
    const existing = groups.get(message.sender.userId);
    if (existing === undefined) {
      groups.set(message.sender.userId, {
        sender: message.sender,
        count: 1,
        newestText: message.text,
        newestSentAt: message.sentAt,
        newestMessageId: message.messageId,
      });
      continue;
    }
    existing.count += 1;
    if (Date.parse(message.sentAt) > Date.parse(existing.newestSentAt)) {
      existing.newestText = message.text;
      existing.newestSentAt = message.sentAt;
      existing.newestMessageId = message.messageId;
    }
  }
  return [...groups.values()].sort(
    (a, b) => Date.parse(b.newestSentAt) - Date.parse(a.newestSentAt),
  );
}

/**
 * Number of people with unread messages.
 * @param messages Unread messages.
 * @returns The number of distinct senders.
 */
export function unreadSenderCount(messages: readonly UnreadMessage[]): number {
  return new Set(messages.map((m) => m.sender.userId)).size;
}
