/**
 * notes.ts (mock)
 * Mock notes with create, edit and delete. Only Tee has seeded notes.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { lastChange } from "../../utils/notes";
import { ApiError } from "../errors";
import type { NotesApi } from "../notes";
import type { Note, NotePerson } from "../types";
import { authed, db, newId } from "./db";
import { PEOPLE } from "./fixtures";

/** Notes are stored per author; the seeded ones belong to Tee. */
const authorOf = new Map<string, string>();

/**
 * The notes written by a user.
 * @param me The author.
 * @returns Their notes.
 */
function mine(me: string): Note[] {
  return db().notes.filter((n) => (authorOf.get(n.noteId) ?? "usr_tee") === me);
}

/**
 * Finds one of my notes.
 * @param me The author.
 * @param noteId The note.
 * @returns The note.
 * @throws ApiError NOTE_NOT_FOUND when missing or someone else's.
 */
function findMine(me: string, noteId: string): Note {
  const note = mine(me).find((n) => n.noteId === noteId);
  if (note === undefined) {
    throw new ApiError(404, "NOTE_NOT_FOUND", "No such note");
  }
  return note;
}

export const mockNotesApi: NotesApi = {
  /**
   * Mock of GET /notes/people: the people I wrote about, the latest change first.
   * @returns The people with their note count and latest note.
   * @throws ApiError UNAUTHENTICATED when no one is signed in.
   */
  async getPeople() {
    const me = (await authed()).profile.userId;
    const people: NotePerson[] = [];
    for (const person of PEOPLE) {
      const notes = mine(me)
        .filter((n) => n.aboutUserId === person.userId)
        .sort((a, b) => lastChange(b) - lastChange(a));
      if (notes.length > 0) {
        const { noteId, text, createdAt, updatedAt } = notes[0];
        people.push({
          user: {
            userId: person.userId,
            displayName: person.displayName,
            photoUrl: person.photoUrl,
          },
          noteCount: notes.length,
          lastNote: { noteId, text, createdAt, updatedAt },
        });
      }
    }
    return people.sort((a, b) => lastChange(b.lastNote) - lastChange(a.lastNote));
  },
  /**
   * Mock of GET /notes.
   * @param aboutUserId The person the notes are about.
   * @returns My notes about them, newest first.
   * @throws ApiError UNAUTHENTICATED when no one is signed in.
   */
  async getNotes(aboutUserId) {
    const me = (await authed()).profile.userId;
    return mine(me)
      .filter((n) => n.aboutUserId === aboutUserId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .map((n) => ({ ...n }));
  },
  /**
   * Mock of POST /notes.
   * @param aboutUserId The person the note is about.
   * @param text The note text.
   * @returns The new note.
   * @throws ApiError UNAUTHENTICATED when no one is signed in.
   */
  async create(aboutUserId, text) {
    const me = (await authed()).profile.userId;
    const note: Note = {
      noteId: newId("not"),
      aboutUserId,
      text,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    authorOf.set(note.noteId, me);
    db().notes.push(note);
    return { ...note };
  },
  /**
   * Mock of PATCH /notes/{noteId}.
   * @param noteId The note.
   * @param text The new text.
   * @returns The updated note.
   * @throws ApiError NOTE_NOT_FOUND when the note is missing or someone else's.
   * @throws ApiError UNAUTHENTICATED when no one is signed in.
   */
  async update(noteId, text) {
    const me = (await authed()).profile.userId;
    const note = findMine(me, noteId);
    note.text = text;
    note.updatedAt = new Date().toISOString();
    return { ...note };
  },
  /**
   * Mock of DELETE /notes/{noteId}.
   * @param noteId The note.
   * @returns After the note is deleted.
   * @throws ApiError NOTE_NOT_FOUND when the note is missing or someone else's.
   * @throws ApiError UNAUTHENTICATED when no one is signed in.
   */
  async remove(noteId) {
    const me = (await authed()).profile.userId;
    findMine(me, noteId);
    db().notes = db().notes.filter((n) => n.noteId !== noteId);
  },
};
