/**
 * UnreadBadge.tsx
 * Red count badge: "1" to "9", then "9+" (design.md 3.10 and 3.12).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, space } from "../theme";
import { formatUnreadCount } from "../utils/format";

/** Diameter of the badge on list rows, and the font size at that and at the smaller tab-bar size. */
const BADGE_SIZE = 20;
const BADGE_FONT_LARGE = 11;
const BADGE_FONT_SMALL = 10;

/** Props for UnreadBadge. */
export interface UnreadBadgeProps {
  count: number;
  /** Diameter: 20 on rows, 16 on the tab bar. */
  size?: number;
}

/**
 * An unread badge.
 * @param props.count The count; nothing is drawn at 0.
 * @param props.size The diameter.
 * @returns The badge, or null.
 */
export function UnreadBadge({
  count,
  size = BADGE_SIZE,
}: UnreadBadgeProps): React.JSX.Element | null {
  const text = formatUnreadCount(count);
  if (text === null) {
    return null;
  }
  return (
    <View
      style={[styles.badge, { minWidth: size, height: size, borderRadius: size / 2 }]}
      accessible
      accessibilityLabel={`${text} unread`}
    >
      <Text
        style={[styles.text, size === BADGE_SIZE ? styles.textLarge : styles.textSmall]}
        allowFontScaling={false}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.xs,
  },
  text: {
    color: colors.white,
    fontFamily: fonts.bold,
  },
  textLarge: {
    fontSize: BADGE_FONT_LARGE,
  },
  textSmall: {
    fontSize: BADGE_FONT_SMALL,
  },
});
