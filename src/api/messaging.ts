/**
 * messaging.ts
 * Conversations, messages, replies, read state and unread messages (api-integration.md 6.10,
 * 6.11).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { USE_MOCKS } from "../constants/env";
import { MESSAGES_PAGE, UNREAD_LIMIT } from "../constants/limits";
import { request } from "./client";
import { mockMessagingApi } from "./mocks/messaging";
import type { Conversation, Message, MessagePage, UnreadMessage } from "./types";

/** Messaging endpoints. */
export interface MessagingApi {
  /** GET /conversations: favorites first, then newest. */
  getConversations: () => Promise<Conversation[]>;
  /** GET /conversations/{userId}/messages, newest first. @throws ApiError USER_NOT_FOUND. */
  getMessages: (userId: string, before?: string) => Promise<MessagePage>;
  /** POST /conversations/{userId}/messages. @throws ApiError INVALID_INPUT, USER_NOT_FOUND. */
  sendMessage: (userId: string, text: string) => Promise<Message>;
  /** POST /messages/{messageId}/replies. @throws ApiError MESSAGE_NOT_FOUND. */
  reply: (messageId: string, text: string) => Promise<Message>;
  /** PATCH /conversations/{userId}. @throws ApiError INVALID_INPUT. */
  markRead: (userId: string, lastReadMessageId: string) => Promise<void>;
  /** GET /messages?unread=true, newest first. */
  getUnread: () => Promise<{ messages: UnreadMessage[]; hasMore: boolean }>;
}

const realMessagingApi: MessagingApi = {
  async getConversations() {
    const result = await request<{ conversations: Conversation[] }>("GET", "/conversations");
    return result.conversations;
  },
  getMessages: (userId, before) =>
    request<MessagePage>("GET", `/conversations/${encodeURIComponent(userId)}/messages`, {
      query: { limit: MESSAGES_PAGE, before },
    }),
  sendMessage: (userId, text) =>
    request<Message>("POST", `/conversations/${encodeURIComponent(userId)}/messages`, {
      body: { text },
    }),
  reply: (messageId, text) =>
    request<Message>("POST", `/messages/${encodeURIComponent(messageId)}/replies`, {
      body: { text },
    }),
  async markRead(userId, lastReadMessageId) {
    await request<unknown>("PATCH", `/conversations/${encodeURIComponent(userId)}`, {
      body: { lastReadMessageId },
    });
  },
  getUnread: () =>
    request<{ messages: UnreadMessage[]; hasMore: boolean }>("GET", "/messages", {
      query: { unread: true, limit: UNREAD_LIMIT },
    }),
};

/** Messaging endpoints, real or mock. */
export const messagingApi: MessagingApi = USE_MOCKS ? mockMessagingApi : realMessagingApi;
