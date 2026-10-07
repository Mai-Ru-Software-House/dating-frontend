/**
 * NoteCard.tsx
 * One note in a list (design.md 3.18): the time of its last change and its first line. The whole
 * card opens the note.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Pressable, StyleSheet, Text } from "react-native";

import type { Note } from "../api/types";
import { colors, fonts, PRESSED_OPACITY, radius, space, type } from "../theme";
import { firstLine, formatNoteTime } from "../utils/format";

/** Props for NoteCard. */
export interface NoteCardProps {
  note: Note;
  onPress: () => void;
  /** The current time, for "Today" and "Yesterday". */
  now?: Date;
}

/**
 * A note card.
 * @param props See NoteCardProps.
 * @returns The card.
 */
export function NoteCard({ note, onPress, now }: NoteCardProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint="Opens the note"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.time}>{formatNoteTime(note, now)}</Text>
      <Text style={styles.text} numberOfLines={1}>
        {firstLine(note.text)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    gap: space.xs,
    marginBottom: space.md,
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
  time: {
    ...type.caption,
    fontFamily: fonts.semibold,
    color: colors.muted,
  },
  text: {
    ...type.body,
    color: colors.ink,
  },
});
