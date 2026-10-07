/**
 * useConversationMessages.ts
 * Messages of one conversation (api-integration.md 6.10): pages of 30 loaded older-first on demand,
 * mark as read up to their newest message, and sends that show at once and settle when the server
 * answers (or turn into "Not sent. Tap to retry.").
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { messagingApi } from "../../api/messaging";
import type { MessageQuote } from "../../api/types";
import { keys } from "../../session/queryClient";
import { applySent, mergeOlderPages, type ChatMessage } from "../../utils/groupMessages";

/** What the hook returns. */
export interface ConversationMessages {
  messages: ChatMessage[];
  isLoading: boolean;
  error: unknown;
  hasMore: boolean;
  isLoadingOlder: boolean;
  loadOlder: () => void;
  refetch: () => Promise<unknown>;
  /** Sends text, as a reply when `replyTo` is set. */
  send: (text: string, replyTo: MessageQuote | null) => void;
  /** Sends a failed message again. */
  retry: (clientId: string) => void;
}

/**
 * One conversation's messages.
 * @param userId The other person.
 * @param myId The logged-in user.
 * @returns The messages and actions.
 */
export function useConversationMessages(userId: string, myId: string): ConversationMessages {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<ChatMessage[]>([]);
  const query = useInfiniteQuery({
    queryKey: keys.messages(userId),
    queryFn: ({ pageParam }) => messagingApi.getMessages(userId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.hasMore ? last.messages[last.messages.length - 1]?.messageId : undefined,
  });

  const server = useMemo(
    () =>
      (query.data?.pages ?? []).reduce<ChatMessage[]>(
        (all, page) => mergeOlderPages(all, page.messages),
        [],
      ),
    [query.data],
  );
  const serverIds = useMemo(() => new Set(server.map((m) => m.messageId)), [server]);
  const messages = useMemo(
    () => [...server, ...pending.filter((m) => !serverIds.has(m.messageId))],
    [server, pending, serverIds],
  );

  useEffect(() => {
    const newestFromThem = server.find((m) => m.senderId === userId);
    if (newestFromThem === undefined || !server.some((m) => m.senderId === userId && !m.isRead)) {
      return;
    }
    const markRead = async (): Promise<void> => {
      try {
        await messagingApi.markRead(userId, newestFromThem.messageId);
        await queryClient.invalidateQueries({ queryKey: keys.conversations });
        await queryClient.invalidateQueries({ queryKey: keys.unread });
      } catch {
        // Not critical: the next open marks them again.
      }
    };
    void markRead();
  }, [server, userId, queryClient]);

  const deliver = async (entry: ChatMessage): Promise<void> => {
    const clientId = entry.clientId ?? entry.messageId;
    try {
      const sent = entry.replyTo
        ? await messagingApi.reply(entry.replyTo.messageId, entry.text)
        : await messagingApi.sendMessage(userId, entry.text);
      setPending((list) => applySent(list, clientId, sent));
      await queryClient.invalidateQueries({ queryKey: keys.messages(userId) });
      await queryClient.invalidateQueries({ queryKey: keys.conversations });
    } catch {
      setPending((list) => applySent(list, clientId, null));
    }
  };

  const send = (text: string, replyTo: MessageQuote | null): void => {
    const clientId = `local-${Date.now()}`;
    const entry: ChatMessage = {
      messageId: clientId,
      clientId,
      senderId: myId,
      receiverId: userId,
      text,
      sentAt: new Date().toISOString(),
      isRead: false,
      replyTo,
      sendState: "pending",
    };
    setPending((list) => [...list, entry]);
    void deliver(entry);
  };

  const retry = (clientId: string): void => {
    const entry = pending.find((m) => m.clientId === clientId);
    if (entry === undefined) {
      return;
    }
    const again: ChatMessage = { ...entry, sendState: "pending", sentAt: new Date().toISOString() };
    setPending((list) => list.map((m) => (m.clientId === clientId ? again : m)));
    void deliver(again);
  };

  return {
    messages,
    isLoading: query.isLoading,
    error: query.error,
    hasMore: query.hasNextPage,
    isLoadingOlder: query.isFetchingNextPage,
    loadOlder: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage();
      }
    },
    refetch: query.refetch,
    send,
    retry,
  };
}
