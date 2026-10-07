/**
 * InfoRow.tsx
 * Read-only label and value in a ListGroup (design.md 3.21). The value is never cut off; on narrow
 * screens it wraps under the label.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, Text, View } from "react-native";

import { colors, size, space, type } from "../theme";

/** Props for InfoRow. */
export interface InfoRowProps {
  label: string;
  value: string;
}

/**
 * An info row.
 * @param props.label Left text.
 * @param props.value Right text.
 * @returns The row.
 */
export function InfoRow({ label, value }: InfoRowProps): React.JSX.Element {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}, ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: size.infoRow,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  label: {
    ...type.body,
    color: colors.ink,
  },
  value: {
    ...type.body,
    color: colors.muted,
    marginLeft: "auto",
  },
});
