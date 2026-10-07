/**
 * NoteEditor.tsx
 * The new-note editor (design.md 3.18): multiline input in a card with an accent border while
 * focused, an "n / 500" counter and a small Save button, disabled while empty or over 500.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { NOTE_MAX } from "../constants/limits";
import { colors, radius, space, type } from "../theme";
import { noteRule, ruleMessage } from "../utils/rules";
import { Button } from "./Button";
import { FieldError } from "./FieldError";

/** Props for NoteEditor. */
export interface NoteEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  isSaving?: boolean;
  /** A server error on the text. */
  error?: string;
}

/**
 * The note editor.
 * @param props See NoteEditorProps.
 * @returns The editor card.
 */
export function NoteEditor({
  value,
  onChangeText,
  onSave,
  isSaving = false,
  error,
}: NoteEditorProps): React.JSX.Element {
  const [isFocused, setIsFocused] = useState(true);
  const rule = noteRule(value);
  const length = value.trim().length;
  const isOver = length > NOTE_MAX;

  return (
    <View>
      <View style={[styles.card, isFocused && styles.focused]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          autoFocus
          multiline
          editable={!isSaving}
          accessibilityLabel="New note"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.input}
        />
        <View style={styles.footer}>
          <Text style={[styles.counter, isOver && styles.over]}>
            {length} / {NOTE_MAX}
          </Text>
          <Button
            label="Save"
            onPress={onSave}
            isSmall
            isDisabled={!rule.isValid}
            isLoading={isSaving}
          />
        </View>
      </View>
      <FieldError message={ruleMessage(rule) ?? error} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 110,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: space.lg,
    gap: space.sm,
  },
  focused: {
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  input: {
    ...type.body,
    color: colors.ink,
    minHeight: 42,
    padding: 0,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counter: {
    ...type.caption,
    color: colors.muted,
  },
  over: {
    color: colors.accent,
  },
});
