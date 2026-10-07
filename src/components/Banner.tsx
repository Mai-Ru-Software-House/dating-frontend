/**
 * Banner.tsx
 * Inline form message (design.md 3.20): accentSoft card with a warning icon and accent text.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { TriangleAlert } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, ICON_STROKE, radius, space } from "../theme";

/** Props for Banner. */
export interface BannerProps {
  /** The message; nothing is drawn when empty. */
  message?: string | null;
}

/**
 * An error banner.
 * @param props.message The message.
 * @returns The banner, or null.
 */
export function Banner({ message }: BannerProps): React.JSX.Element | null {
  if (!message) {
    return null;
  }
  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <TriangleAlert size={20} color={colors.accent} strokeWidth={ICON_STROKE} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    borderRadius: radius.small,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
  },
  text: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.accent,
    flexShrink: 1,
  },
});
