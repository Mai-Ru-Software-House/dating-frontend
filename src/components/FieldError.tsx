/**
 * FieldError.tsx
 * The error line under a field: warning icon and message in accent, announced to screen readers
 * when it appears (design.md 3.2).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { TriangleAlert } from "lucide-react-native";
import { useEffect } from "react";
import { AccessibilityInfo, Platform, StyleSheet, Text, View } from "react-native";

import { colors, ICON_STROKE, space, type } from "../theme";

/** Props for FieldError. */
export interface FieldErrorProps {
  /** The message; nothing is drawn when it is empty or undefined. */
  message?: string;
}

/**
 * An inline field error.
 * @param props.message The message.
 * @returns The error row, or null.
 */
export function FieldError({ message }: FieldErrorProps): React.JSX.Element | null {
  useEffect(() => {
    if (message && Platform.OS === "ios") {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [message]);

  if (!message) {
    return null;
  }
  return (
    <View style={styles.row} accessibilityLiveRegion="polite">
      <TriangleAlert size={15} color={colors.accent} strokeWidth={ICON_STROKE} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: space.sm,
  },
  text: {
    ...type.label,
    color: colors.accent,
    flexShrink: 1,
  },
});
