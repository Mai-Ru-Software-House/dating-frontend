/**
 * matching.ts (mock)
 * Mock recommendations (Fern, Mint, Ploy, Kwan, Fah for Tee) and search (filtered, nearest first).
 * EXPO_PUBLIC_MOCK_FAIL=match makes recommendations fail.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { MOCK_FAIL } from "../../constants/env";
import { SEARCH_LIMIT } from "../../constants/limits";
import { ApiError } from "../errors";
import type { MatchingApi } from "../matching";
import type { CandidateCard } from "../types";
import { authed } from "./db";
import { PEOPLE, TEE, type MockPerson } from "./fixtures";

/**
 * A mock person as a card.
 * @param person The person.
 * @param withScore Include the match score.
 * @returns The card.
 */
function toCard(person: MockPerson, withScore: boolean): CandidateCard {
  const { lookingFor: _lookingFor, matchScore, ...card } = person;
  return withScore ? { ...card, matchScore } : card;
}

export const mockMatchingApi: MatchingApi = {
  async getRecommendations(limit) {
    const me = await authed();
    if (MOCK_FAIL === "match") {
      throw new ApiError(500, "MATCH_ENGINE_UNAVAILABLE", "Match Engine timed out");
    }
    if (me.profile.userId !== TEE.userId) {
      return [];
    }
    return PEOPLE.slice(0, limit).map((p) => toCard(p, true));
  },
  async searchCandidates(criteria) {
    const me = await authed();
    if (me.profile.userId !== TEE.userId) {
      return [];
    }
    const prefs = me.profile.preferences;
    const minAge = criteria.minAge ?? prefs.minAge;
    const maxAge = criteria.maxAge ?? prefs.maxAge;
    const genders: string[] = criteria.targetGenders ?? prefs.targetGenders;
    const maxKm = criteria.maxDistanceKm ?? prefs.radiusKm;
    return PEOPLE.filter(
      (p) =>
        p.age >= minAge && p.age <= maxAge && genders.includes(p.gender) && p.distanceKm <= maxKm,
    )
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, criteria.limit ?? SEARCH_LIMIT)
      .map((p) => toCard(p, false));
  },
};
