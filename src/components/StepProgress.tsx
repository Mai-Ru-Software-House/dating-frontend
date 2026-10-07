/**
 * StepProgress.tsx
 * Three progress bars with labels for Create profile (design.md 3.6).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, space, type } from "../theme";

const BAR_HEIGHT = 4;

/** Props for StepProgress. */
export interface StepProgressProps {
  /** Step labels, in order. */
  steps: readonly string[];
  /** The current step, starting at 1. */
  current: number;
}

/**
 * Step progress bars.
 * @param props.steps The labels.
 * @param props.current The current step (1-based).
 * @returns The progress row.
 */
export function StepProgress({ steps, current }: StepProgressProps): React.JSX.Element {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Step ${current} of ${steps.length}: ${steps[current - 1] ?? ""}`}
    >
      {steps.map((label, index) => {
        const step = index + 1;
        return (
          <View key={label} style={styles.step}>
            <View
              style={[
                styles.bar,
                { backgroundColor: step <= current ? colors.accent : colors.line },
              ]}
            />
            <Text
              style={[styles.label, step === current ? styles.current : styles.other]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: space.sm,
  },
  step: {
    flex: 1,
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    marginBottom: space.sm,
  },
  label: {
    ...type.caption,
  },
  current: {
    color: colors.ink,
    fontFamily: fonts.semibold,
  },
  other: {
    color: colors.muted,
  },
});
