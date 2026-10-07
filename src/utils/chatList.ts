/**
 * chatList.ts
 * Chat list sections and on-device search (design.md 6.11).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { Conversation } from "../api/types";

/** The two sections of the chat list. */
export interface ChatSections {
  favorites: Conversation[];
  others: Conversation[];
}

/**
 * Splits conversations into favorites and the rest, keeping the server order in each.
 * The app's favorites set wins over a stale isFavorite on the row.
 * @param conversations Conversations in server order.
 * @param favorites The favorites set, or undefined to trust isFavorite.
 * @returns The two sections.
 */
export function splitChats(
  conversations: readonly Conversation[],
  favorites?: ReadonlySet<string>,
): ChatSections {
  const isFav = (c: Conversation): boolean =>
    favorites === undefined ? c.isFavorite : favorites.has(c.user.userId);
  return {
    favorites: conversations.filter(isFav),
    others: conversations.filter((c) => !isFav(c)),
  };
}

/**
 * Filters a list by display name, ignoring case.
 * @param items The list.
 * @param nameOf Gets an item's display name.
 * @param query The search text; empty keeps everything.
 * @returns The matching items, order kept.
 */
export function filterByName<T>(
  items: readonly T[],
  nameOf: (item: T) => string,
  query: string,
): T[] {
  const needle = query.trim().toLocaleLowerCase();
  if (needle === "") {
    return [...items];
  }
  return items.filter((item) => nameOf(item).toLocaleLowerCase().includes(needle));
}

/**
 * Filters conversations by the other person's name.
 * @param conversations The list.
 * @param query The search text.
 * @returns The matching conversations.
 */
export function filterChats(conversations: readonly Conversation[], query: string): Conversation[] {
  return filterByName(conversations, (c) => c.user.displayName, query);
}
