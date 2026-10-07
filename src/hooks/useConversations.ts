/**
 * useConversations.ts
 * The chat list query (api-integration.md 6.10).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { messagingApi } from "../api/messaging";
import type { Conversation } from "../api/types";
import { keys } from "../session/queryClient";

/**
 * Conversations: favorites first, then newest.
 * @returns The query.
 */
export function useConversations(): UseQueryResult<Conversation[]> {
  return useQuery({ queryKey: keys.conversations, queryFn: messagingApi.getConversations });
}
