/**
 * ActionBar.tsx
 * Fixed bottom bar for forms and profiles (design.md 3.19): bg fill, top border, 20 pt padding,
 * buttons side by side with a 12 pt gap, plus the bottom safe area.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useKeyboardVisible } from "../hooks/useKeyboardVisible";
import { colors, columnStyle, GUTTER, space } from "../theme";

/** Props for ActionBar. */
export interface ActionBarProps {
  /** The buttons; give each `style={{ flex: 1 }}`. */
  children: ReactNode;
  /** Shown above the buttons (a form-level Banner). */
  top?: ReactNode;
}

/**
 * The bottom action bar.
 * @param props.children The buttons.
 * @param props.top Optional content above the buttons.
 * @returns The bar.
 */
export function ActionBar({ children, top }: ActionBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const isKeyboardOpen = useKeyboardVisible();
  return (
    <View style={[styles.bar, { paddingBottom: (isKeyboardOpen ? 0 : insets.bottom) + space.xl }]}>
      <View style={[columnStyle, styles.inner]}>
        {top}
        <View style={styles.row}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: space.xl,
  },
  inner: {
    paddingHorizontal: GUTTER,
    gap: space.md,
  },
  row: {
    flexDirection: "row",
    gap: space.md,
  },
});
