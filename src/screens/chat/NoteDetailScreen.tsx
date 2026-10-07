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
  const actions = useNoteActions(noteId, aboutUserId, () => setIsLeaving(true));
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
  const cancelEdit = (): void => (isChanged ? setDialog("discard") : setIsEditing(false));
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

  const footer =
    !FEATURES.manageNotes || note === undefined ? undefined : isEditing ? (
      <ActionBar>
        <Button
          label="Cancel"
          variant="secondary"
          onPress={cancelEdit}
          isDisabled={actions.isSaving}
          style={styles.flex}
        />
        <Button
          label="Save"
          onPress={() => void save()}
          isDisabled={!isChanged || !rule.isValid}
          isLoading={actions.isSaving}
          style={styles.flex}
        />
      </ActionBar>
    ) : (
      <ActionBar>
        <Button
          label="Delete"
          variant="danger"
          onPress={() => setDialog("delete")}
          style={styles.flex}
        />
        <Button label="Edit" onPress={startEdit} style={styles.flex} />
      </ActionBar>
    );

  return (
    <Screen header={<TopBar title="Note" onBack={() => navigation.goBack()} />} footer={footer}>
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
          error={(isEditing ? ruleMessage(rule) : undefined) ?? actions.saveError}
        />
      ) : null}
      <ConfirmDialog
        isVisible={dialog === "delete"}
        icon={Trash2}
        title="Delete this note?"
        message="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDialog(null)}
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
