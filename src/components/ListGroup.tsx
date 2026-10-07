/**
 * ListGroup.tsx
 * Grouped, settings-style card (design.md 3.21) with 1 pt dividers between rows that start where
 * the rows' text starts.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Children, Fragment, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors, radius, space } from "../theme";

/** Props for ListGroup. */
export interface ListGroupProps {
  children: ReactNode;
  /** Where dividers start from the card's left edge (default 16). */
  dividerInset?: number;
}

/**
 * A grouped list card.
 * @param props.children The rows.
 * @param props.dividerInset Divider start.
 * @returns The card.
 */
export function ListGroup({
  children,
  dividerInset = space.lg,
}: ListGroupProps): React.JSX.Element {
  const rows = Children.toArray(children);
  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 ? <View style={[styles.divider, { marginLeft: dividerInset }]} /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
  },
});
