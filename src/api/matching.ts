/**
 * matching.ts
 * Recommendations and search (api-integration.md 6.7, 6.8).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { USE_MOCKS } from "../constants/env";
import { SEARCH_LIMIT } from "../constants/limits";
import { request } from "./client";
import { mockMatchingApi } from "./mocks/matching";
import type { CandidateCard, SearchCriteria } from "./types";

/** Matching endpoints. */
export interface MatchingApi {
  /** GET /recommendations?limit=. @throws ApiError MATCH_ENGINE_UNAVAILABLE. */
  getRecommendations: (limit: number) => Promise<CandidateCard[]>;
  /** GET /candidates, nearest first. @throws ApiError INVALID_INPUT, MATCH_ENGINE_UNAVAILABLE. */
  searchCandidates: (criteria: SearchCriteria) => Promise<CandidateCard[]>;
}

const realMatchingApi: MatchingApi = {
  async getRecommendations(limit) {
    const result = await request<{ recommendations: CandidateCard[] }>("GET", "/recommendations", {
      query: { limit },
    });
    return result.recommendations;
  },
  async searchCandidates(criteria) {
    const result = await request<{ candidates: CandidateCard[] }>("GET", "/candidates", {
      query: {
        minAge: criteria.minAge,
        maxAge: criteria.maxAge,
        targetGenders: criteria.targetGenders,
        maxDistanceKm: criteria.maxDistanceKm,
        limit: criteria.limit ?? SEARCH_LIMIT,
      },
    });
    return result.candidates;
  },
};

/** Matching endpoints, real or mock. */
export const matchingApi: MatchingApi = USE_MOCKS ? mockMatchingApi : realMatchingApi;
