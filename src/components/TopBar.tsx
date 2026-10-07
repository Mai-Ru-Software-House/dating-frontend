/**
 * TopBar.tsx
 * 56 pt top bar under the safe area (design.md 3.11): back button, optional centered title and an
 * optional right-side element. Content sits in the same centered column as the screen.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, columnStyle, GUTTER, size, type } from "../theme";
import { BackButton } from "./BackButton";

/** Props for TopBar. */
export interface TopBarProps {
  /** Centered title. */
  title?: string;
  /** Back handler; no back button when missing. */
  onBack?: () => void;
  /** Element at the right. */
  right?: ReactNode;
}

/**
 * A top bar.
 * @param props See TopBarProps.
 * @returns The bar.
 */
export function TopBar({ title, onBack, right }: TopBarProps): React.JSX.Element {
  return (
    <View style={styles.bar}>
      <View style={[columnStyle, styles.inner]}>
        <View style={styles.side}>{onBack ? <BackButton onPress={onBack} /> : null}</View>
        {title ? (
          <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>
        ) : (
          <View style={styles.spacer} />
        )}
        <View style={[styles.side, styles.right]}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: size.topBar,
    justifyContent: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: GUTTER,
  },
  side: {
    width: size.touch + 8,
  },
  right: {
    alignItems: "flex-end",
  },
  title: {
    ...type.navTitle,
    color: colors.ink,
    flex: 1,
    textAlign: "center",
  },
  spacer: {
    flex: 1,
  },
});
