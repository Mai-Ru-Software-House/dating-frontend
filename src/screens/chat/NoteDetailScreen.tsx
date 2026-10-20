/**
 * NoteDetailScreen.tsx
 * One note (design.md 6.15, designs 15 to 17): read it, edit it in place, or delete it after a
 * confirmation. Edit and delete sit behind FEATURES.manageNotes; without them the page is read-only.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { usePreventRemove, type NavigationAction } from "@react-navigation/native";
import { Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import { ActionBar } from "../../components/ActionBar";
import { Button } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Screen } from "../../components/Screen";
import { TopBar } from "../../components/TopBar";
import { FEATURES } from "../../constants/features";
import { useNotes } from "../../hooks/useNotes";
import type { RootScreenProps } from "../../navigation/types";
import { formatNoteTime } from "../../utils/format";
import { noteRule, ruleMessage } from "../../utils/rules";
import { NoteBody } from "./NoteBody";
import { NoteSubject } from "./NoteSubject";
import { useNoteActions } from "./useNoteActions";

/**
 * The error under the note: the length rule while editing, else the last save error.
 * @param isEditing Whether the note is being edited.
 * @param rule The result of the note length rule for the draft.
 * @param saveError The last save error, if any.
 * @returns The message, or undefined.
 */
function bodyError(
  isEditing: boolean,
  rule: ReturnType<typeof noteRule>,
  saveError: string | undefined,
): string | undefined {
  return (isEditing ? ruleMessage(rule) : undefined) ?? saveError;
}

/** What the note page's bottom bar needs. */
interface FooterOptions {
  /** False hides the bar (notes can't be managed, or the note is not loaded). */
  isShown: boolean;
  isEditing: boolean;
  isSaveEnabled: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * The bottom bar: Cancel and Save while editing, Delete and Edit otherwise.
 * @param options What the bar shows and does.
 * @returns The bar, or undefined when it is hidden.
 */
function renderFooter(options: FooterOptions): React.JSX.Element | undefined {
  if (!options.isShown) {
    return undefined;
  }
  if (options.isEditing) {
    return (
      <ActionBar>
        <Button
          label="Cancel"
          variant="secondary"
          onPress={options.onCancel}
          isDisabled={options.isSaving}
          style={styles.flex}
        />
        <Button
          label="Save"
          onPress={options.onSave}
          isDisabled={!options.isSaveEnabled}
          isLoading={options.isSaving}
          style={styles.flex}
        />
      </ActionBar>
    );
  }
  return (
    <ActionBar>
      <Button label="Delete" variant="danger" onPress={options.onDelete} style={styles.flex} />
      <Button label="Edit" onPress={options.onEdit} style={styles.flex} />
    </ActionBar>
  );
}

/**
 * The note page.
 * @param props Navigation and route ({ noteId, aboutUserId, displayName, photoUrl }).
 * @returns The screen.
 */
export function NoteDetailScreen({
  navigation,
  route,
}: RootScreenProps<"NoteDetail">): React.JSX.Element {
  const { noteId, aboutUserId, displayName, photoUrl } = route.params;
  const notes = useNotes(aboutUserId);
  const note = notes.data?.find((n) => n.noteId === noteId);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [dialog, setDialog] = useState<"delete" | "discard" | null>(null);
  const [pendingLeave, setPendingLeave] = useState<NavigationAction | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const actions = useNoteActions(noteId, aboutUserId, () => {
    setIsLeaving(true);
  });
  const isChanged = isEditing && note !== undefined && draft !== note.text;
  const isMissing = notes.isSuccess && note === undefined;

  usePreventRemove(isChanged && !isLeaving, ({ data }) => {
    setPendingLeave(data.action);
    setDialog("discard");
  });
  useEffect(() => {
    if (isLeaving || isMissing) {
      if (pendingLeave !== null) {
        navigation.dispatch(pendingLeave);
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [isLeaving, isMissing, pendingLeave, navigation]);

  const rule = noteRule(draft);
  const startEdit = (): void => {
    setDraft(note?.text ?? "");
    setIsEditing(true);
  };
  const cancelEdit = (): void => {
    if (isChanged) {
      setDialog("discard");
    } else {
      setIsEditing(false);
    }
  };
  const save = async (): Promise<void> => {
    if (await actions.save(draft.trim())) {
      setIsEditing(false);
    }
  };
  const confirmDiscard = (): void => {
    setDialog(null);
    setIsEditing(false);
    if (pendingLeave !== null) {
      setIsLeaving(true);
    }
  };
  const confirmDelete = async (): Promise<void> => {
    const isDeleted = await actions.remove();
    setDialog(null);
    if (isDeleted) {
      setIsLeaving(true);
    }
  };

  const footer = renderFooter({
    isShown: FEATURES.manageNotes && note !== undefined,
    isEditing,
    isSaveEnabled: isChanged && rule.isValid,
    isSaving: actions.isSaving,
    onCancel: cancelEdit,
    onSave: () => void save(),
    onEdit: startEdit,
    onDelete: () => {
      setDialog("delete");
    },
  });

  return (
    <Screen
      header={
        <TopBar
          title="Note"
          onBack={() => {
            navigation.goBack();
          }}
        />
      }
      footer={footer}
    >
      <NoteSubject
        user={{ userId: aboutUserId, displayName, photoUrl }}
        caption="Only you can see this note."
      />
      {note !== undefined ? (
        <NoteBody
          time={formatNoteTime(note)}
          text={note.text}
          isEditing={isEditing}
          draft={draft}
          onChangeDraft={(text) => {
            setDraft(text);
            actions.clearSaveError();
          }}
          isSaving={actions.isSaving}
          error={bodyError(isEditing, rule, actions.saveError)}
        />
      ) : null}
      <ConfirmDialog
        isVisible={dialog === "delete"}
        icon={Trash2}
        title="Delete this note?"
        message="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => {
          setDialog(null);
        }}
        onConfirm={() => void confirmDelete()}
        isBusy={actions.isDeleting}
      />
      <ConfirmDialog
        isVisible={dialog === "discard"}
        title="Discard changes?"
        message="Your edits will be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        onCancel={() => {
          setDialog(null);
          setPendingLeave(null);
        }}
        onConfirm={confirmDiscard}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
