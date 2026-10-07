/**
 * useNewNote.ts
 * The new-note editor's state (design.md 6.14): open, text, Save with POST /notes, and adding the
 * saved note to the top of the cached list.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { messageFor } from "../../api/errors";
import { notesApi } from "../../api/notes";
import type { Note } from "../../api/types";
import { keys } from "../../session/queryClient";
import { addNote } from "../../utils/notes";

/** What useNewNote returns. */
export interface NewNote {
  isOpen: boolean;
  text: string;
  setText: (text: string) => void;
  isSaving: boolean;
  error?: string;
  open: () => void;
  close: () => void;
  save: () => Promise<void>;
}

/**
 * The new-note editor.
 * @param aboutUserId The person the note is about.
 * @returns The editor state.
 */
export function useNewNote(aboutUserId: string): NewNote {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const close = (): void => {
    setIsOpen(false);
    setText("");
    setError(undefined);
  };
  const save = async (): Promise<void> => {
    setIsSaving(true);
    setError(undefined);
    try {
      const note = await notesApi.create(aboutUserId, text.trim());
      queryClient.setQueryData<Note[]>(keys.notes(aboutUserId), (list) =>
        addNote(list ?? [], note),
      );
      void queryClient.invalidateQueries({ queryKey: keys.notePeople });
      close();
    } catch (failure) {
      setError(messageFor(failure));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isOpen,
    text,
    setText: (next) => {
      setText(next);
      setError(undefined);
    },
    isSaving,
    error,
    open: () => setIsOpen(true),
    close,
    save,
  };
}
