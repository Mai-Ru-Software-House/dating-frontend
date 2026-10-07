/**
 * notes.ts
 * Notes ordering and cache updates (api-integration.md 6.13). Notes sort by their last change:
 * updatedAt if set, else createdAt.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { Note, NotePerson } from "../api/types";

/**
 * The time of a note's last change.
 * @param note The note.
 * @returns Milliseconds since the epoch.
 */
export function lastChange(note: { createdAt: string; updatedAt?: string | null }): number {
  return Date.parse(note.updatedAt ?? note.createdAt);
}

/**
 * Sorts notes, most recent change first.
 * @param notes Notes in any order.
 * @returns A new sorted list.
 */
export function sortNotes(notes: readonly Note[]): Note[] {
  return [...notes].sort((a, b) => lastChange(b) - lastChange(a));
}

/**
 * Adds a new note to the cached list.
 * @param notes The cached list.
 * @param note The note from POST /notes.
 * @returns The sorted list with the note in it once.
 */
export function addNote(notes: readonly Note[], note: Note): Note[] {
  return sortNotes([note, ...notes.filter((n) => n.noteId !== note.noteId)]);
}

/**
 * Replaces an edited note in the cached list.
 * @param notes The cached list.
 * @param note The updated note from PATCH /notes/{noteId}.
 * @returns The sorted list, same length.
 */
export function replaceNote(notes: readonly Note[], note: Note): Note[] {
  return sortNotes(notes.map((n) => (n.noteId === note.noteId ? note : n)));
}

/**
 * Removes a deleted note from the cached list.
 * @param notes The cached list.
 * @param noteId The deleted note's ID.
 * @returns The list without it.
 */
export function removeNote(notes: readonly Note[], noteId: string): Note[] {
  return notes.filter((n) => n.noteId !== noteId);
}

/**
 * Splits the Notes tab's people into favorites and others, each by latest note activity.
 * @param people People from GET /notes/people.
 * @param favorites The favorites set.
 * @returns The two sections.
 */
export function splitNotePeople(
  people: readonly NotePerson[],
  favorites: ReadonlySet<string>,
): { favorites: NotePerson[]; others: NotePerson[] } {
  const sorted = [...people].sort((a, b) => lastChange(b.lastNote) - lastChange(a.lastNote));
  return {
    favorites: sorted.filter((p) => favorites.has(p.user.userId)),
    others: sorted.filter((p) => !favorites.has(p.user.userId)),
  };
}
