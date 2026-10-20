/**
 * RowRight.tsx
 * The right side of a list row: time and unread badge (conversation), match score (candidate), or
 * time and note count (person with notes).
 * Created by Tee (Kittiphon Kijpinyochai), 20 October 2026
 */
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, type } from "../theme";
import { ScorePill } from "./ScorePill";
import { UnreadBadge } from "./UnreadBadge";

/** What sits at the right of the row. */
export type ListRowRight =
  | { kind: "conversation"; time: string; unreadCount: number }
  | { kind: "candidate"; score?: number }
  | { kind: "person"; time: string; countLabel: string };

/** Props for RowRight. */
export interface RowRightProps {
  /** What to show. */
  right: ListRowRight;
  /** Red time when unread. */
  isUnread: boolean;
}

/**
 * The right side of a row.
 * @param props See RowRightProps.
 * @returns The right column, or null.
 */
export function RowRight({ right, isUnread }: RowRightProps): React.JSX.Element | null {
  if (right.kind === "candidate") {
    return right.score === undefined ? null : <ScorePill score={right.score} />;
  }
  if (right.kind === "person") {
    return (
      <View style={styles.right}>
        <Text style={styles.personTime}>{right.time}</Text>
        <Text style={styles.count}>{right.countLabel}</Text>
      </View>
    );
  }
  return (
    <View style={styles.right}>
      <Text style={[styles.time, { color: isUnread ? colors.accent : colors.muted }]}>
        {right.time}
      </Text>
      <UnreadBadge count={right.unreadCount} />
    </View>
  );
}

const styles = StyleSheet.create({
  right: {
    alignItems: "flex-end",
    gap: 6,
  },
  time: {
    ...type.caption,
  },
  personTime: {
    ...type.captionMedium,
    color: colors.muted,
  },
  count: {
    ...type.caption,
    color: colors.muted,
    fontFamily: fonts.regular,
  },
});
