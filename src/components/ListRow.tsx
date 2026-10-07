/**
 * ListRow.tsx
 * A 76 pt list row (design.md 3.10): avatar, name with optional star, one-line subtitle, and a
 * right side for conversations (time + badge), candidates (score) or people with notes (time +
 * count).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Star } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { UserSummary } from "../api/types";
import { colors, fonts, ICON_STROKE, PRESSED_OPACITY, size, space, type } from "../theme";
import { Avatar } from "./Avatar";
import { ScorePill } from "./ScorePill";
import { UnreadBadge } from "./UnreadBadge";

/** What sits at the right of the row. */
export type ListRowRight =
  | { kind: "conversation"; time: string; unreadCount: number }
  | { kind: "candidate"; score?: number }
  | { kind: "person"; time: string; countLabel: string };

/** Props for ListRow. */
export interface ListRowProps {
  user: UserSummary;
  title: string;
  subtitle: string;
  right: ListRowRight;
  isFavorite?: boolean;
  /** Bold title and subtitle, red time. */
  isUnread?: boolean;
  onPress: () => void;
  /** Hide the divider (last row). */
  isLast?: boolean;
}

/**
 * A list row.
 * @param props See ListRowProps.
 * @returns The row.
 */
export function ListRow(props: ListRowProps): React.JSX.Element {
  const { user, title, subtitle, right, isFavorite = false, isUnread = false, onPress } = props;
  const isBold = isUnread || right.kind === "person";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar
        userId={user.userId}
        displayName={user.displayName}
        photoUrl={user.photoUrl}
        size={size.avatarRow}
      />
      <View style={[styles.body, !props.isLast && styles.divider]}>
        <View style={styles.text}>
          <View style={styles.titleRow}>
            <Text
              style={[isBold ? type.rowTitleUnread : type.rowTitle, styles.title]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {isFavorite ? (
              <Star
                size={14}
                color={colors.fav}
                fill={colors.fav}
                strokeWidth={ICON_STROKE}
                accessibilityLabel="Favorite"
              />
            ) : null}
          </View>
          <Text
            style={[isUnread ? styles.subUnread : styles.sub]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        </View>
        <RowRight right={right} isUnread={isUnread} />
      </View>
    </Pressable>
  );
}

/**
 * The right side of a row.
 * @param props.right What to show.
 * @param props.isUnread Red time when unread.
 * @returns The right column, or null.
 */
function RowRight({
  right,
  isUnread,
}: {
  right: ListRowRight;
  isUnread: boolean;
}): React.JSX.Element | null {
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: size.listRow,
    gap: 14,
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
  body: {
    flex: 1,
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.md,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    color: colors.ink,
    flexShrink: 1,
  },
  sub: {
    ...type.rowSub,
    color: colors.muted,
  },
  subUnread: {
    ...type.rowSubUnread,
    color: colors.ink,
  },
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
