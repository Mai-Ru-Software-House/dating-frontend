/**
 * recommendations.ts
 * Load more for recommendations: pages of 10 by offset, until hasMore is false or 200 are loaded.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { CandidateCard } from "../api/types";
import { RECOMMENDATIONS_MAX, RECOMMENDATIONS_PAGE } from "../constants/limits";

/**
 * The offset of the next page to load when the list's end is reached.
 * @param hasMore The last page's hasMore.
 * @param loaded How many cards are loaded so far.
 * @returns The next offset, or null when there is nothing more to load.
 */
export function nextOffset(hasMore: boolean, loaded: number): number | null {
  if (!hasMore || loaded + RECOMMENDATIONS_PAGE > RECOMMENDATIONS_MAX) {
    return null;
  }
  return loaded;
}

/**
 * Removes repeated people, keeping the first appearance and the order.
 * @param cards Cards from the API.
 * @returns Cards with unique userIds.
 */
export function dedupeCandidates(cards: readonly CandidateCard[]): CandidateCard[] {
  const seen = new Set<string>();
  return cards.filter((card) => {
    if (seen.has(card.userId)) {
      return false;
    }
    seen.add(card.userId);
    return true;
  });
}

/**
 * Splits results into the top match card and the rows under it.
 * @param cards Cards, best first.
 * @returns The first card (or null) and the rest.
 */
export function splitTopMatch(cards: readonly CandidateCard[]): {
  card: CandidateCard | null;
  rows: CandidateCard[];
} {
  return { card: cards[0] ?? null, rows: cards.slice(1) };
}
