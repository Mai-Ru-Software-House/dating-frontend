/**
 * notes.ts
 * Private notes about people (api-integration.md 6.13). GET /notes/people, PATCH and DELETE are
 * frontend requests not in the contract yet (8.10, 8.11).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { USE_MOCKS } from "../constants/env";
import { request } from "./client";
import { mockNotesApi } from "./mocks/notes";
import type { Note, NotePerson } from "./types";

/** Note endpoints. */
export interface NotesApi {
  /** GET /notes/people (pending 8.10). */
  getPeople: () => Promise<NotePerson[]>;
  /** GET /notes?aboutUserId=. @throws ApiError USER_NOT_FOUND. */
  getNotes: (aboutUserId: string) => Promise<Note[]>;
  /** POST /notes. @throws ApiError INVALID_INPUT (field text). */
  create: (aboutUserId: string, text: string) => Promise<Note>;
  /** PATCH /notes/{noteId} (pending 8.11). @throws ApiError NOTE_NOT_FOUND, INVALID_INPUT. */
  update: (noteId: string, text: string) => Promise<Note>;
  /** DELETE /notes/{noteId} (pending 8.11). @throws ApiError NOTE_NOT_FOUND. */
  remove: (noteId: string) => Promise<void>;
}

const realNotesApi: NotesApi = {
  async getPeople() {
    const result = await request<{ people: NotePerson[] }>("GET", "/notes/people");
    return result.people;
  },
  async getNotes(aboutUserId) {
    const result = await request<{ notes: Note[] }>("GET", "/notes", { query: { aboutUserId } });
    return result.notes;
  },
  create: (aboutUserId, text) => request<Note>("POST", "/notes", { body: { aboutUserId, text } }),
  update: (noteId, text) =>
    request<Note>("PATCH", `/notes/${encodeURIComponent(noteId)}`, { body: { text } }),
  async remove(noteId) {
    await request<void>("DELETE", `/notes/${encodeURIComponent(noteId)}`);
  },
};

/** Note endpoints, real or mock. */
export const notesApi: NotesApi = USE_MOCKS ? mockNotesApi : realNotesApi;
