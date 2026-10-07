/**
 * messaging.ts (mock)
 * Mock conversations built from the in-memory messages. The other people never reply or read.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { MESSAGES_PAGE } from "../../constants/limits";
import { ApiError } from "../errors";
import type { MessagingApi } from "../messaging";
import type { Conversation, Message, UserSummary } from "../types";
import { authed, db, favoritesOf, newId } from "./db";
import { PEOPLE } from "./fixtures";

/**
 * A person's summary.
 * @param userId The user.
 * @returns Their summary.
 * @throws ApiError USER_NOT_FOUND.
 */
function summaryOf(userId: string): UserSummary {
  const person = PEOPLE.find((p) => p.userId === userId);
  if (person === undefined) {
    throw new ApiError(404, "USER_NOT_FOUND", "No user with that ID");
  }
  return { userId, displayName: person.displayName, photoUrl: person.photoUrl };
}

/**
 * Messages between me and another user, newest first.
 * @param me My ID.
 * @param other Their ID.
 * @returns The thread.
 */
function thread(me: string, other: string): Message[] {
  const all = db().messages;
  return all
    .filter(
      (m) =>
        (m.senderId === me && m.receiverId === other) ||
        (m.senderId === other && m.receiverId === me),
    )
    .sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt) || all.indexOf(b) - all.indexOf(a));
}

/**
 * Stores a new message from me.
 * @param me My ID.
 * @param to The receiver.
 * @param text The text.
 * @param replyTo The quoted message, if a reply.
 * @returns The stored message.
 */
function store(me: string, to: string, text: string, replyTo: Message | null): Message {
  const message: Message = {
    messageId: newId("msg"),
    senderId: me,
    receiverId: to,
    text,
    sentAt: new Date().toISOString(),
    isRead: false,
    replyTo: replyTo
      ? { messageId: replyTo.messageId, senderId: replyTo.senderId, text: replyTo.text }
      : null,
  };
  db().messages.push(message);
  return message;
}

export const mockMessagingApi: MessagingApi = {
  async getConversations() {
    const me = (await authed()).profile.userId;
    const favorites = favoritesOf(me);
    const others = new Set<string>();
    for (const m of db().messages) {
      if (m.senderId === me) others.add(m.receiverId);
      if (m.receiverId === me) others.add(m.senderId);
    }
    const conversations: Conversation[] = [...others].map((other) => {
      const messages = thread(me, other);
      const last = messages[0];
      return {
        user: summaryOf(other),
        isFavorite: favorites.has(other),
        lastMessage: {
          messageId: last.messageId,
          senderId: last.senderId,
          text: last.text,
          sentAt: last.sentAt,
        },
        unreadCount: messages.filter((m) => m.senderId === other && !m.isRead).length,
      };
    });
    return conversations.sort(
      (a, b) =>
        Number(b.isFavorite) - Number(a.isFavorite) ||
        Date.parse(b.lastMessage.sentAt) - Date.parse(a.lastMessage.sentAt),
    );
  },
  async getMessages(userId, before) {
    const me = (await authed()).profile.userId;
    summaryOf(userId);
    const all = thread(me, userId);
    const start = before === undefined ? 0 : all.findIndex((m) => m.messageId === before) + 1;
    const page = all.slice(start, start + MESSAGES_PAGE);
    return { messages: page.map((m) => ({ ...m })), hasMore: start + MESSAGES_PAGE < all.length };
  },
  async sendMessage(userId, text) {
    const me = (await authed()).profile.userId;
    summaryOf(userId);
    return { ...store(me, userId, text, null) };
  },
  async reply(messageId, text) {
    const me = (await authed()).profile.userId;
    const original = db().messages.find((m) => m.messageId === messageId);
    if (original === undefined || (original.senderId !== me && original.receiverId !== me)) {
      throw new ApiError(404, "MESSAGE_NOT_FOUND", "No such message");
    }
    const to = original.senderId === me ? original.receiverId : original.senderId;
    return { ...store(me, to, text, original) };
  },
  async markRead(userId, lastReadMessageId) {
    const me = (await authed()).profile.userId;
    const last = db().messages.find((m) => m.messageId === lastReadMessageId);
    if (last === undefined) {
      throw new ApiError(400, "INVALID_INPUT", "Unknown message", "lastReadMessageId");
    }
    for (const m of db().messages) {
      if (m.senderId === userId && m.receiverId === me && m.sentAt <= last.sentAt) {
        m.isRead = true;
      }
    }
  },
  async getUnread() {
    const me = (await authed()).profile.userId;
    const messages = db()
      .messages.filter((m) => m.receiverId === me && !m.isRead)
      .sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt))
      .map((m) => ({
        messageId: m.messageId,
        sender: summaryOf(m.senderId),
        text: m.text,
        sentAt: m.sentAt,
      }));
    return { messages, hasMore: false };
  },
};
