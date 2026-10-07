/**
 * useNotes.ts
 * Notes about one person, most recent change first, and the Notes tab's people
 * (api-integration.md 6.13). If GET /notes/people doesn't exist yet, the people come from the chat
 * list without previews (design.md 6.13 fallback).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { toApiError } from "../api/errors";
import { messagingApi } from "../api/messaging";
import { notesApi } from "../api/notes";
import type { Note, NotePerson } from "../api/types";
import { keys } from "../session/queryClient";
import { sortNotes } from "../utils/notes";

/**
 * Notes about one person.
 * @param aboutUserId The person.
 * @returns The query; data sorted by last change.
 */
export function useNotes(aboutUserId: string): UseQueryResult<Note[]> {
  return useQuery({
    queryKey: keys.notes(aboutUserId),
    queryFn: async () => sortNotes(await notesApi.getNotes(aboutUserId)),
  });
}

/** A Notes tab row; `isFallback` rows have no preview, time or count. */
export interface NotePeopleResult {
  people: NotePerson[];
  isFallback: boolean;
}

/**
 * Loads the people with notes, falling back to the chat list when the endpoint is missing.
 * @returns The people.
 * @throws ApiError when both fail.
 */
async function loadPeople(): Promise<NotePeopleResult> {
  try {
    return { people: await notesApi.getPeople(), isFallback: false };
  } catch (error) {
    if (toApiError(error).code !== "NOT_FOUND") {
      throw error;
    }
    const conversations = await messagingApi.getConversations();
    const people = conversations.map((c) => ({
      user: c.user,
      noteCount: 0,
      lastNote: { noteId: "", text: "", createdAt: c.lastMessage.sentAt, updatedAt: null },
    }));
    return { people, isFallback: true };
  }
}

/**
 * The Notes tab's people.
 * @returns The query.
 */
export function useNotePeople(): UseQueryResult<NotePeopleResult> {
  return useQuery({ queryKey: keys.notePeople, queryFn: loadPeople });
}
