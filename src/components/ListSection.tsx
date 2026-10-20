/**
 * ListSection.tsx
 * A labelled group of rows on a list screen (Chats, Notes people), drawn only when it has rows.
 * Created by Tee (Kittiphon Kijpinyochai), 20 October 2026
 */
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { space } from "../theme";
import { SectionLabel } from "./SectionLabel";

/** Props for ListSection. */
export interface ListSectionProps<T> {
  /** The label above the rows. */
  label: string;
  /** Draw a star beside the label (the Favorites section). */
  hasStar?: boolean;
  /** The rows' data. Nothing is drawn when empty. */
  items: readonly T[];
  /** Draws one row; the row needs its own key. */
  renderItem: (item: T) => ReactNode;
}

/**
 * A labelled group of rows.
 * @param props See ListSectionProps.
 * @returns The group, or null when there are no rows.
 */
export function ListSection<T>({
  label,
  hasStar = false,
  items,
  renderItem,
}: ListSectionProps<T>): React.JSX.Element | null {
  if (items.length === 0) {
    return null;
  }
  return (
    <View style={styles.section}>
      <SectionLabel label={label} hasStar={hasStar} />
      {items.map(renderItem)}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: space.xl,
  },
});
