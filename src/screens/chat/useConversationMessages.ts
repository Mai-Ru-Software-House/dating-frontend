/**
 * useConversationMessages.ts
 * Messages of one conversation (api-integration.md 6.10): pages of 30 loaded older-first on demand,
 * mark as read up to their newest message, and sends that show at once and settle when the server
 * answers (or turn into "Not sent. Tap to retry.").
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useInfiniteQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";

import { CHAT_POLL_MS } from "../../constants/limits";
import { messagingApi } from "../../api/messaging";
import type { Message, MessageQuote } from "../../api/types";
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
 * Joins the loaded pages and the unsent messages into the list the screen shows.
 * @param pages The loaded pages of server messages, newest page first.
 * @param pending Messages sent from this phone that the server has not confirmed yet.
 * @returns The server messages, and all messages with the pending ones that the server lacks.
 */
function useMergedMessages(
  pages: { messages: Message[] }[] | undefined,
  pending: ChatMessage[],
): { server: ChatMessage[]; messages: ChatMessage[] } {
  const server = useMemo(
    () =>
      (pages ?? []).reduce<ChatMessage[]>((all, page) => mergeOlderPages(all, page.messages), []),
    [pages],
  );
  const serverIds = useMemo(() => new Set(server.map((m) => m.messageId)), [server]);
  const messages = useMemo(
    () => [...server, ...pending.filter((m) => !serverIds.has(m.messageId))],
    [server, pending, serverIds],
  );
  return { server, messages };
}

/**
 * Marks the conversation as read whenever the other person has unread messages in it.
 * @param server The server messages.
 * @param userId The other person.
 */
function useMarkRead(server: ChatMessage[], userId: string): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!server.some((m) => m.senderId === userId && !m.isRead)) {
      return;
    }
    const markRead = async (): Promise<void> => {
      try {
        await messagingApi.markRead(userId);
        await queryClient.invalidateQueries({ queryKey: keys.conversations });
        await queryClient.invalidateQueries({ queryKey: keys.unread });
      } catch {
        // Not critical: the next open marks them again.
      }
    };
    void markRead();
  }, [server, userId, queryClient]);
}

/**
 * Sends a message and settles its pending entry: confirmed with the server's copy, or failed.
 * @param queryClient The query client, to refresh the conversation and the chat list.
 * @param userId The other person.
 * @param entry The pending message.
 * @param setPending Updates the pending list.
 * @returns After the send settled.
 */
async function deliver(
  queryClient: QueryClient,
  userId: string,
  entry: ChatMessage,
  setPending: Dispatch<SetStateAction<ChatMessage[]>>,
): Promise<void> {
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
}

/**
 * A message that is shown at once while it is being sent.
 * @param text The message text.
 * @param replyTo The quoted message, when this is a reply.
 * @param myId The logged-in user.
 * @param userId The other person.
 * @returns The pending message.
 */
function pendingMessage(
  text: string,
  replyTo: MessageQuote | null,
  myId: string,
  userId: string,
): ChatMessage {
  const clientId = `local-${String(Date.now())}`;
  return {
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
    refetchInterval: CHAT_POLL_MS,
    getNextPageParam: (last) =>
      last.hasMore ? last.messages[last.messages.length - 1]?.messageId : undefined,
  });
  const { server, messages } = useMergedMessages(query.data?.pages, pending);
  useMarkRead(server, userId);

  const send = (text: string, replyTo: MessageQuote | null): void => {
    const entry = pendingMessage(text, replyTo, myId, userId);
    setPending((list) => [...list, entry]);
    void deliver(queryClient, userId, entry, setPending);
  };

  const retry = (clientId: string): void => {
    const entry = pending.find((m) => m.clientId === clientId);
    if (entry === undefined) {
      return;
    }
    const again: ChatMessage = { ...entry, sendState: "pending", sentAt: new Date().toISOString() };
    setPending((list) => list.map((m) => (m.clientId === clientId ? again : m)));
    void deliver(queryClient, userId, again, setPending);
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
