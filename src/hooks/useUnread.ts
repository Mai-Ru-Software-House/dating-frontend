/**
 * useUnread.ts
 * Unread messages for Home, the Chats tile and the Chats tab badge, all from one ['unread'] query
 * (api-integration.md 6.11).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { messagingApi } from "../api/messaging";
import { keys } from "../session/queryClient";
import { groupUnread, type UnreadGroup } from "../utils/unread";

/** What useUnread returns. */
export interface Unread {
  groups: UnreadGroup[];
  /** People with unread messages. */
  senderCount: number;
  isLoading: boolean;
  isRefetching: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}

/**
 * Unread messages grouped by sender.
 * @param isEnabled Whether to load (false while signed out).
 * @returns The groups and the query state.
 */
export function useUnread(isEnabled = true): Unread {
  const query = useQuery({
    queryKey: keys.unread,
    queryFn: messagingApi.getUnread,
    enabled: isEnabled,
  });
  const groups = useMemo(() => groupUnread(query.data?.messages ?? []), [query.data]);
  return {
    groups,
    senderCount: groups.length,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}
