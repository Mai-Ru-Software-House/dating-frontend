/**
 * SliderKnob.tsx
 * One draggable slider knob (design.md 3.5): a 22 pt white circle with an accent border, dragged
 * with react-native-gesture-handler and moved by Reanimated on the UI thread, adjustable by screen
 * readers.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { colors } from "../theme";

/** Knob diameter. */
export const KNOB_SIZE = 22;

/** How long the knob takes to settle on its step after the finger lifts. */
const SETTLE_MS = 90;

/** Props for SliderKnob. */
export interface SliderKnobProps {
  /** The knob's value. */
  value: number;
  /** Left edge of the knob in points. Moves on the UI thread while dragging. */
  x: SharedValue<number>;
  /** The value at the start of the track. */
  trackMin: number;
  /** Points per step of 1. */
  pointsPerStep: number;
  /** Lowest and highest offset the knob may reach, in points (stops at the other knob). */
  minAt: number;
  maxAt: number;
  /** Called with the whole value under the knob, only when it changes. */
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
 * A slider knob. The finger moves it directly on the UI thread, so it follows without waiting for
 * React; the value is reported to React only when it crosses to the next whole step.
 * @param props See SliderKnobProps.
 * @returns The knob.
 */
export function SliderKnob(props: SliderKnobProps): React.JSX.Element {
  const {
    value,
    x,
    trackMin,
    pointsPerStep,
    minAt,
    maxAt,
    onDrag,
    onStep,
    accessibilityLabel,
    min,
    max,
  } = props;
  const startX = useSharedValue(0);
  const reported = useSharedValue(value);
  const isDragging = useSharedValue(false);

  // Follow the value when it changes from outside the drag (steps, resets, first layout).
  useEffect(() => {
    // A new width (first layout, rotation) places the knob at once; a new value glides there.
    const target = (value - trackMin) * pointsPerStep;
    const isNewValue = reported.get() !== value;
    reported.set(value);
    if (!isDragging.get()) {
      x.set(isNewValue ? withTiming(target, { duration: SETTLE_MS }) : target);
    }
  }, [value, trackMin, pointsPerStep, x, reported, isDragging]);

  const pan = Gesture.Pan()
    .hitSlop({ horizontal: 11, vertical: 11 })
    .onBegin(() => {
      isDragging.set(true);
      startX.set(x.get());
    })
    .onUpdate((event) => {
      if (pointsPerStep <= 0) {
        return;
      }
      const next = Math.min(maxAt, Math.max(minAt, startX.get() + event.translationX));
      x.set(next);
      const wanted = trackMin + Math.round(next / pointsPerStep);
      if (wanted !== reported.get()) {
        reported.set(wanted);
        scheduleOnRN(onDrag, wanted);
      }
    })
    .onFinalize(() => {
      isDragging.set(false);
      x.set(withTiming((reported.get() - trackMin) * pointsPerStep, { duration: SETTLE_MS }));
    });

  const style = useAnimatedStyle(() => ({ left: x.get() }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.knob, style]}
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
