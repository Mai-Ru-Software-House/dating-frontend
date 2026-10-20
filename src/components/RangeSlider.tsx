/**
 * RangeSlider.tsx
 * Two-knob slider for the age range (design.md 3.5). Knobs move in steps of 1 and never cross.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useState } from "react";
import { useSharedValue } from "react-native-reanimated";

import { formatAgeRange } from "../utils/format";
import { moveHigh, moveLow, positionOf } from "../utils/slider";
import { SliderFrame } from "./SliderFrame";
import { SliderKnob } from "./SliderKnob";

/** Props for RangeSlider. */
export interface RangeSliderProps {
  label: string;
  /** Lower and upper end of the track. */
  min: number;
  max: number;
  /** The chosen [low, high]. */
  value: readonly [number, number];
  /** Called with the new [low, high]. */
  onChange: (value: [number, number]) => void;
  /** Screen reader names of the two knobs. */
  lowLabel?: string;
  highLabel?: string;
}

/**
 * A two-knob range slider.
 * @param props See RangeSliderProps.
 * @returns The slider.
 */
export function RangeSlider(props: RangeSliderProps): React.JSX.Element {
  const { label, min, max, value, onChange, lowLabel = "Minimum", highLabel = "Maximum" } = props;
  const [trackWidth, setTrackWidth] = useState(0);
  const lowX = useSharedValue(positionOf(value[0], trackWidth, min, max));
  const highX = useSharedValue(positionOf(value[1], trackWidth, min, max));
  const pointsPerStep = max > min ? trackWidth / (max - min) : 0;
  const setLow = (low: number): void => {
    const next = moveLow(value, low, min);
    if (next[0] !== value[0]) {
      onChange(next);
    }
  };
  const setHigh = (high: number): void => {
    const next = moveHigh(value, high, max);
    if (next[1] !== value[1]) {
      onChange(next);
    }
  };

  return (
    <SliderFrame
      label={label}
      valueText={formatAgeRange(value[0], value[1])}
      startLabel={String(min)}
      endLabel={String(max)}
      fillFrom={lowX}
      fillTo={highX}
      onTrackWidth={setTrackWidth}
    >
      <SliderKnob
        value={value[0]}
        x={lowX}
        trackMin={min}
        pointsPerStep={pointsPerStep}
        minAt={0}
        maxAt={(value[1] - min) * pointsPerStep}
        onDrag={setLow}
        onStep={setLow}
        accessibilityLabel={lowLabel}
        min={min}
        max={value[1]}
      />
      <SliderKnob
        value={value[1]}
        x={highX}
        trackMin={min}
        pointsPerStep={pointsPerStep}
        minAt={(value[0] - min) * pointsPerStep}
        maxAt={trackWidth}
        onDrag={setHigh}
        onStep={setHigh}
        accessibilityLabel={highLabel}
        min={value[0]}
        max={max}
      />
    </SliderFrame>
  );
}
