/**
 * useNoteActions.ts
 * Edit and delete on the note page (design.md 6.15, api-integration.md 6.13). Both wait for the
 * server. A NOTE_NOT_FOUND means the note is already gone: drop it and leave.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ERROR_COPY, messageFor, toApiError } from "../../api/errors";
import { notesApi } from "../../api/notes";
import type { Note } from "../../api/types";
import { useToast } from "../../components/Toast";
import { keys } from "../../session/queryClient";
import { removeNote, replaceNote } from "../../utils/notes";

/** What useNoteActions returns. */
export interface NoteActions {
  isSaving: boolean;
  isDeleting: boolean;
  saveError?: string;
  clearSaveError: () => void;
  /** PATCH; resolves true when saved. */
  save: (text: string) => Promise<boolean>;
  /** DELETE; resolves true when the note is gone. */
  remove: () => Promise<boolean>;
}

/**
 * Removes a note from the cached list and refreshes the people list.
 * @param queryClient The query client.
 * @param aboutUserId The note's person, for the cache key.
 * @param noteId The note.
 */
function dropFromCache(queryClient: QueryClient, aboutUserId: string, noteId: string): void {
  queryClient.setQueryData<Note[]>(keys.notes(aboutUserId), (list) =>
    removeNote(list ?? [], noteId),
  );
  void queryClient.invalidateQueries({ queryKey: keys.notePeople });
}

/**
 * Puts a saved note in the cached list in place of its old version and refreshes the people list.
 * @param queryClient The query client.
 * @param aboutUserId The note's person, for the cache key.
 * @param note The saved note.
 */
function replaceInCache(queryClient: QueryClient, aboutUserId: string, note: Note): void {
  queryClient.setQueryData<Note[]>(keys.notes(aboutUserId), (list) =>
    replaceNote(list ?? [], note),
  );
  void queryClient.invalidateQueries({ queryKey: keys.notePeople });
}

/**
 * Handles NOTE_NOT_FOUND, which means the note is already gone: drops it, says so and leaves.
 * @param noteId The note.
 * @param aboutUserId Its person, for the cache key.
 * @param onGone Called when the note no longer exists (leave the page).
 * @returns A function that handles an error and returns true when it was NOTE_NOT_FOUND.
 */
function useLeaveIfGone(
  noteId: string,
  aboutUserId: string,
  onGone: () => void,
): (error: unknown) => boolean {
  const queryClient = useQueryClient();
  const toast = useToast();
  return (error) => {
    if (toApiError(error).code !== "NOTE_NOT_FOUND") {
      return false;
    }
    dropFromCache(queryClient, aboutUserId, noteId);
    toast.show(ERROR_COPY.NOTE_NOT_FOUND);
    onGone();
    return true;
  };
}

/**
 * PATCH the note, with its busy flag and error.
 * @param noteId The note.
 * @param aboutUserId Its person, for the cache key.
 * @param leaveIfGone Handles NOTE_NOT_FOUND.
 * @returns The save action and its state.
 */
function useSaveNote(
  noteId: string,
  aboutUserId: string,
  leaveIfGone: (error: unknown) => boolean,
): Pick<NoteActions, "isSaving" | "saveError" | "clearSaveError" | "save"> {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();

  const save = async (text: string): Promise<boolean> => {
    setIsSaving(true);
    setSaveError(undefined);
    try {
      replaceInCache(queryClient, aboutUserId, await notesApi.update(noteId, text));
      return true;
    } catch (error) {
      if (!leaveIfGone(error)) {
        setSaveError(messageFor(error));
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveError,
    clearSaveError: () => {
      setSaveError(undefined);
    },
    save,
  };
}

/**
 * DELETE the note, with its busy flag.
 * @param noteId The note.
 * @param aboutUserId Its person, for the cache key.
 * @param leaveIfGone Handles NOTE_NOT_FOUND.
 * @returns The remove action and its state.
 */
function useDeleteNote(
  noteId: string,
  aboutUserId: string,
  leaveIfGone: (error: unknown) => boolean,
): Pick<NoteActions, "isDeleting" | "remove"> {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const remove = async (): Promise<boolean> => {
    setIsDeleting(true);
    try {
      await notesApi.remove(noteId);
      dropFromCache(queryClient, aboutUserId, noteId);
      toast.show("Note deleted.");
      return true;
    } catch (error) {
      if (!leaveIfGone(error)) {
        toast.show("Couldn't delete the note. Try again.");
      }
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { isDeleting, remove };
}

/**
 * Note actions.
 * @param noteId The note.
 * @param aboutUserId Its person, for the cache key.
 * @param onGone Called when the note no longer exists (leave the page).
 * @returns The actions.
 */
export function useNoteActions(
  noteId: string,
  aboutUserId: string,
  onGone: () => void,
): NoteActions {
  const leaveIfGone = useLeaveIfGone(noteId, aboutUserId, onGone);
  const saving = useSaveNote(noteId, aboutUserId, leaveIfGone);
  const deleting = useDeleteNote(noteId, aboutUserId, leaveIfGone);
  return { ...saving, ...deleting };
}
