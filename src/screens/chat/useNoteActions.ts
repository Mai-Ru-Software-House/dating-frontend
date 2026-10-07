/**
 * useNoteActions.ts
 * Edit and delete on the note page (design.md 6.15, api-integration.md 6.13). Both wait for the
 * server. A NOTE_NOT_FOUND means the note is already gone: drop it and leave.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();

  const drop = (): void => {
    queryClient.setQueryData<Note[]>(keys.notes(aboutUserId), (list) =>
      removeNote(list ?? [], noteId),
    );
    void queryClient.invalidateQueries({ queryKey: keys.notePeople });
  };
  const gone = (): void => {
    drop();
    toast.show(ERROR_COPY.NOTE_NOT_FOUND);
    onGone();
  };

  const save = async (text: string): Promise<boolean> => {
    setIsSaving(true);
    setSaveError(undefined);
    try {
      const note = await notesApi.update(noteId, text);
      queryClient.setQueryData<Note[]>(keys.notes(aboutUserId), (list) =>
        replaceNote(list ?? [], note),
      );
      void queryClient.invalidateQueries({ queryKey: keys.notePeople });
      return true;
    } catch (error) {
      if (toApiError(error).code === "NOTE_NOT_FOUND") {
        gone();
      } else {
        setSaveError(messageFor(error));
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (): Promise<boolean> => {
    setIsDeleting(true);
    try {
      await notesApi.remove(noteId);
      drop();
      toast.show("Note deleted.");
      return true;
    } catch (error) {
      if (toApiError(error).code === "NOTE_NOT_FOUND") {
        gone();
        return false;
      }
      toast.show("Couldn't delete the note. Try again.");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isSaving,
    isDeleting,
    saveError,
    clearSaveError: () => setSaveError(undefined),
    save,
    remove,
  };
}
