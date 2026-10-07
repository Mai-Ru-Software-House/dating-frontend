/**
 * NotesScreen.tsx
 * Notes about one person (design.md 6.14, designs 13, 14 and 18): "New note" opens the editor,
 * then "EARLIER" lists the notes, most recent change first. Opened inside the Notes tab or from a
 * conversation. Leaving with text in the editor asks first.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useNavigation, usePreventRemove, type NavigationAction } from "@react-navigation/native";
import { Pencil } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { messageFor } from "../../api/errors";
import { Button } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { LoadError } from "../../components/LoadError";
import { NoteCard } from "../../components/NoteCard";
import { NoteEditor } from "../../components/NoteEditor";
import { RowSkeleton } from "../../components/RowSkeleton";
import { Screen } from "../../components/Screen";
import { SectionLabel } from "../../components/SectionLabel";
import { TopBar } from "../../components/TopBar";
import { useNotes } from "../../hooks/useNotes";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import type { NotesStackScreenProps, RootScreenProps } from "../../navigation/types";
import { colors, space, type } from "../../theme";
import { NoteSubject } from "./NoteSubject";
import { useNewNote } from "./useNewNote";

type Props = RootScreenProps<"Notes"> | NotesStackScreenProps<"NotesInTab">;

/**
 * The Notes screen.
 * @param props Navigation and route ({ userId, displayName, photoUrl }).
 * @returns The screen.
 */
export function NotesScreen({ navigation, route }: Props): React.JSX.Element {
  const person = route.params;
  const isInTab = route.name === "NotesInTab";
  const rootNavigation = useNavigation();
  const query = useNotes(person.userId);
  const editor = useNewNote(person.userId);
  const [pendingLeave, setPendingLeave] = useState<NavigationAction | null>(null);
  const [leaveAction, setLeaveAction] = useState<NavigationAction | null>(null);
  useRefreshOnFocus(query.refetch);
  const notes = query.data ?? [];

  usePreventRemove(editor.isOpen && leaveAction === null, ({ data }) => {
    if (editor.text.trim() === "") {
      editor.close();
    } else {
      setPendingLeave(data.action);
    }
  });
  useEffect(() => {
    if (leaveAction !== null) {
      navigation.dispatch(leaveAction);
    }
  }, [leaveAction, navigation]);

  return (
    <Screen
      isInTabs={isInTab}
      header={<TopBar title="Notes" onBack={() => navigation.goBack()} />}
      onRefresh={query.refetch}
    >
      <NoteSubject user={person} caption="Only you can see these notes." />
      {editor.isOpen ? (
        <NoteEditor
          value={editor.text}
          onChangeText={editor.setText}
          onSave={() => void editor.save()}
          isSaving={editor.isSaving}
          error={editor.error}
        />
      ) : (
        <Button label="New note" icon={Pencil} variant="secondary" onPress={editor.open} />
      )}
      {query.isLoading ? <RowSkeleton count={2} /> : null}
      {query.isError && query.data === undefined ? (
        <LoadError message={messageFor(query.error)} onRetry={() => void query.refetch()} />
      ) : null}
      {query.isSuccess && notes.length === 0 && !editor.isOpen ? (
        <Text style={styles.empty}>No notes about {person.displayName} yet.</Text>
      ) : null}
      {notes.length > 0 ? (
        <View style={styles.section}>
          <SectionLabel label="Earlier" />
          {notes.map((note) => (
            <NoteCard
              key={note.noteId}
              note={note}
              onPress={() =>
                rootNavigation.navigate("NoteDetail", {
                  noteId: note.noteId,
                  aboutUserId: person.userId,
                  displayName: person.displayName,
                  photoUrl: person.photoUrl,
                })
              }
            />
          ))}
        </View>
      ) : null}
      <ConfirmDialog
        isVisible={pendingLeave !== null}
        title="Discard this note?"
        message="What you wrote will be lost."
        cancelLabel="Keep writing"
        confirmLabel="Discard"
        onCancel={() => setPendingLeave(null)}
        onConfirm={() => {
          editor.close();
          setLeaveAction(pendingLeave);
          setPendingLeave(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    ...type.body,
    color: colors.muted,
    textAlign: "center",
    marginTop: space.xxl,
  },
  section: {
    marginTop: space.xxl,
  },
});
