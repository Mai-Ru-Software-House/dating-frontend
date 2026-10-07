/**
 * UnreadBadge.tsx
 * Red count badge: "1" to "9", then "9+" (design.md 3.10 and 3.12).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../theme";
import { formatUnreadCount } from "../utils/format";

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
export function UnreadBadge({ count, size = 20 }: UnreadBadgeProps): React.JSX.Element | null {
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
      <Text style={[styles.text, { fontSize: size === 20 ? 11 : 10 }]} allowFontScaling={false}>
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
    paddingHorizontal: 4,
  },
  text: {
    color: colors.white,
    fontFamily: fonts.bold,
  },
});
