/**
 * queryClient.ts
 * The TanStack Query client and its defaults (implementation-plan.md 5.2): 30 s stale time, one
 * retry for queries but none on 4xx, no retries for mutations.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "../api/errors";

const STALE_MS = 30_000;

/**
 * Whether a failed query is worth one more try.
 * @param failureCount Tries so far.
 * @param error The error.
 * @returns True for one retry of a network or server error.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
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
  recommendations: (limit: number) => ["recommendations", limit] as const,
  recommendationsAll: ["recommendations"] as const,
  candidates: (criteria: object) => ["candidates", criteria] as const,
  candidatesAll: ["candidates"] as const,
  user: (userId: string) => ["user", userId] as const,
  favorites: ["favorites"] as const,
  conversations: ["conversations"] as const,
  messages: (userId: string) => ["messages", userId] as const,
  unread: ["unread"] as const,
  notes: (userId: string) => ["notes", userId] as const,
  notePeople: ["notePeople"] as const,
};
