/**
 * RowSkeleton.tsx
 * Grey placeholder rows while a list loads (design.md 7: skeletons for lists).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, View } from "react-native";

import { colors, size, space } from "../theme";

/** Props for RowSkeleton. */
export interface RowSkeletonProps {
  /** Number of rows (default 3). */
  count?: number;
}

/**
 * Skeleton list rows.
 * @param props.count How many rows.
 * @returns The placeholder rows.
 */
export function RowSkeleton({ count = 3 }: RowSkeletonProps): React.JSX.Element {
  return (
    <View accessibilityLabel="Loading" accessibilityRole="progressbar">
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.avatar} />
          <View style={styles.lines}>
            <View style={[styles.line, styles.short]} />
            <View style={styles.line} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: size.listRow,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: size.avatarRow,
    height: size.avatarRow,
    borderRadius: size.avatarRow / 2,
    backgroundColor: colors.chip,
  },
  lines: {
    flex: 1,
    gap: space.sm,
  },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.chip,
    width: "80%",
  },
  short: {
    width: "40%",
  },
});
