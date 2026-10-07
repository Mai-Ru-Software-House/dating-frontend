/**
 * NoteBody.tsx
 * The full note card on the note page (design.md 6.15): read-only text, or the same card as an
 * input while editing, with "· Editing" on the time line and an "n / 500" counter.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, Text, TextInput, View } from "react-native";

import { FieldError } from "../../components/FieldError";
import { NOTE_MAX } from "../../constants/limits";
import { colors, fonts, radius, space, type } from "../../theme";

/** Props for NoteBody. */
export interface NoteBodyProps {
  time: string;
  text: string;
  isEditing: boolean;
  draft: string;
  onChangeDraft: (text: string) => void;
  isSaving: boolean;
  error?: string;
}

/**
 * The note card.
 * @param props See NoteBodyProps.
 * @returns The card.
 */
export function NoteBody(props: NoteBodyProps): React.JSX.Element {
  const { time, text, isEditing, draft, onChangeDraft, isSaving, error } = props;
  return (
    <View>
      <View style={[styles.card, isEditing && styles.editing]}>
        <Text style={styles.time}>{isEditing ? `${time} · Editing` : time}</Text>
        {isEditing ? (
          <TextInput
            value={draft}
            onChangeText={onChangeDraft}
            multiline
            autoFocus
            editable={!isSaving}
            accessibilityLabel="Note"
            style={[styles.text, styles.input]}
          />
        ) : (
          <Text style={styles.text} selectable>
            {text}
          </Text>
        )}
        {isEditing ? (
          <Text style={[styles.counter, draft.trim().length > NOTE_MAX && styles.over]}>
            {draft.trim().length} / {NOTE_MAX}
          </Text>
        ) : null}
      </View>
      <FieldError message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: space.lg,
    gap: space.md,
  },
  editing: {
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  time: {
    ...type.caption,
    fontFamily: fonts.semibold,
    color: colors.muted,
  },
  text: {
    ...type.noteBody,
    color: colors.ink,
  },
  input: {
    padding: 0,
    textAlignVertical: "top",
  },
  counter: {
    ...type.caption,
    color: colors.muted,
    alignSelf: "flex-end",
  },
  over: {
    color: colors.accent,
  },
});
