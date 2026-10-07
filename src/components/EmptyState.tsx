/**
 * EmptyState.tsx
 * Centered message for an empty list, with an optional second line and button (design.md 6).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, Text, View } from "react-native";

import { colors, space, type } from "../theme";
import { Button, type ButtonVariant } from "./Button";

/** Props for EmptyState. */
export interface EmptyStateProps {
  /** Main line (ink), or the only line (muted) when there is no detail. */
  title: string;
  /** Second line in muted. */
  detail?: string;
  /** Optional button. */
  action?: { label: string; onPress: () => void; variant?: ButtonVariant };
}

/**
 * An empty state.
 * @param props See EmptyStateProps.
 * @returns The message block.
 */
export function EmptyState({ title, detail, action }: EmptyStateProps): React.JSX.Element {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, detail === undefined && styles.mutedTitle]}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      {action ? (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant={action.variant ?? "primary"}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: space.xxxl,
    gap: space.sm,
  },
  title: {
    ...type.body,
    color: colors.ink,
    textAlign: "center",
  },
  mutedTitle: {
    color: colors.muted,
  },
  detail: {
    ...type.body,
    color: colors.muted,
    textAlign: "center",
  },
  button: {
    marginTop: space.lg,
    alignSelf: "stretch",
  },
});
