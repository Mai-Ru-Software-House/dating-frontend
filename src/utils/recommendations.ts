/**
 * recommendations.ts
 * Load more for recommendations (answer 7): ask again with a bigger limit, 10 more at a time, up
 * to 50, stopping at a short page.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { CandidateCard } from "../api/types";
import { RECOMMENDATIONS_MAX, RECOMMENDATIONS_PAGE } from "../constants/limits";

/**
 * The next limit to ask for when the list's end is reached.
 * @param limit The limit of the last request.
 * @param received How many items it returned.
 * @returns The next limit, or null when there is nothing more to load.
 */
export function nextLimit(limit: number, received: number): number | null {
  if (received < limit || limit >= RECOMMENDATIONS_MAX) {
    return null;
  }
  return Math.min(limit + RECOMMENDATIONS_PAGE, RECOMMENDATIONS_MAX);
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
