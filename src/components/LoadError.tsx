/**
 * LoadError.tsx
 * Error state for a failed load: the error's copy and a "Try again" button (design.md 7).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, Text, View } from "react-native";

import { colors, space, type } from "../theme";
import { Button } from "./Button";

/** Props for LoadError. */
export interface LoadErrorProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

/**
 * A load error with retry.
 * @param props See LoadErrorProps.
 * @returns The error block.
 */
export function LoadError({
  message,
  onRetry,
  isRetrying = false,
}: LoadErrorProps): React.JSX.Element {
  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <Text style={styles.text}>{message}</Text>
      <Button
        label="Try again"
        variant="secondary"
        onPress={onRetry}
        isLoading={isRetrying}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: space.xxxl,
    gap: space.lg,
  },
  text: {
    ...type.body,
    color: colors.ink,
    textAlign: "center",
  },
  button: {
    alignSelf: "stretch",
  },
});
