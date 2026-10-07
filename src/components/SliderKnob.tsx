/**
 * SliderKnob.tsx
 * One draggable slider knob (design.md 3.5): a 22 pt white circle with an accent border, dragged
 * with react-native-gesture-handler, adjustable by screen readers.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { colors } from "../theme";

/** Knob diameter. */
export const KNOB_SIZE = 22;

/** Props for SliderKnob. */
export interface SliderKnobProps {
  /** The knob's value. */
  value: number;
  /** Left edge of the knob in points. */
  left: number;
  /** Points per step of 1. */
  pointsPerStep: number;
  /** Called with the value the finger points at (not clamped). */
  onDrag: (value: number) => void;
  /** Called with value ± 1 by screen readers. */
  onStep: (value: number) => void;
  /** Screen reader label, for example "Minimum age". */
  accessibilityLabel: string;
  /** Lower and upper end, for the screen reader value. */
  min: number;
  max: number;
}

/**
 * A slider knob.
 * @param props See SliderKnobProps.
 * @returns The knob.
 */
export function SliderKnob(props: SliderKnobProps): React.JSX.Element {
  const { value, left, pointsPerStep, onDrag, onStep, accessibilityLabel, min, max } = props;
  // event.x is relative to the knob, which moves with the value, so it gives the steps to move.
  const pan = Gesture.Pan()
    .runOnJS(true)
    .hitSlop({ horizontal: 11, vertical: 11 })
    .onUpdate((event) => {
      if (pointsPerStep <= 0) {
        return;
      }
      const steps = Math.round((event.x - KNOB_SIZE / 2) / pointsPerStep);
      if (steps !== 0) {
        onDrag(value + steps);
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[styles.knob, { left }]}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          onStep(event.nativeEvent.actionName === "increment" ? value + 1 : value - 1);
        }}
      />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  knob: {
    position: "absolute",
    top: 0,
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
  },
});
