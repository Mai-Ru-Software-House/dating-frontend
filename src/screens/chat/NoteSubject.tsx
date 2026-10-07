/**
 * NoteSubject.tsx
 * The person a note page is about: avatar 44, name, and a privacy line (design.md 6.14, 6.15).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, Text, View } from "react-native";

import type { UserSummary } from "../../api/types";
import { Avatar } from "../../components/Avatar";
import { colors, fonts, space, type } from "../../theme";

/** Props for NoteSubject. */
export interface NoteSubjectProps {
  user: UserSummary;
  /** "Only you can see these notes." or "Only you can see this note." */
  caption: string;
}

/**
 * The subject row.
 * @param props.user The person.
 * @param props.caption The privacy line.
 * @returns The row.
 */
export function NoteSubject({ user, caption }: NoteSubjectProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Avatar
        userId={user.userId}
        displayName={user.displayName}
        photoUrl={user.photoUrl}
        size={44}
      />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {user.displayName}
        </Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginTop: space.lg,
    marginBottom: space.xxl,
  },
  text: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  caption: {
    ...type.rowSub,
    color: colors.muted,
  },
});
