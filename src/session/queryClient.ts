/**
 * queryClient.ts
 * The TanStack Query client and its defaults (implementation-plan.md 5.2): 30 s stale time, one
 * retry for queries but none on 4xx, no retries for mutations.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "../api/errors";

/** HTTP status range of a client error (4xx): retrying will not help. */
const CLIENT_ERROR_MIN = 400;
const SERVER_ERROR_MIN = 500;

const STALE_MS = 30_000;

/**
 * Whether a failed query is worth one more try.
 * @param failureCount Tries so far.
 * @param error The error.
 * @returns True for one retry of a network or server error.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (
    error instanceof ApiError &&
    error.status >= CLIENT_ERROR_MIN &&
    error.status < SERVER_ERROR_MIN
  ) {
    return false;
  }
  return failureCount < 1;
}

/** The app's query client. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: STALE_MS, retry: shouldRetry, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

/** Query keys (implementation-plan.md 5.2). */
export const keys = {
  me: ["me"] as const,
  knownAccounts: ["knownAccounts"] as const,
  /**
   * Key of the recommendations page of this size.
   * @param limit The page size.
   * @returns The query key.
   */
  recommendations: (limit: number) => ["recommendations", limit] as const,
  recommendationsList: ["recommendations", "list"] as const,
  recommendationsAll: ["recommendations"] as const,
  /**
   * Key of the search results for these criteria.
   * @param criteria The search criteria.
   * @returns The query key.
   */
  candidates: (criteria: object) => ["candidates", criteria] as const,
  candidatesAll: ["candidates"] as const,
  /**
   * Key of one person's profile.
   * @param userId The person.
   * @returns The query key.
   */
  user: (userId: string) => ["user", userId] as const,
  favorites: ["favorites"] as const,
  conversations: ["conversations"] as const,
  /**
   * Key of the messages of one conversation.
   * @param userId The other person.
   * @returns The query key.
   */
  messages: (userId: string) => ["messages", userId] as const,
  unread: ["unread"] as const,
  /**
   * Key of my notes about one person.
   * @param userId The person.
   * @returns The query key.
   */
  notes: (userId: string) => ["notes", userId] as const,
  notePeople: ["notePeople"] as const,
};
