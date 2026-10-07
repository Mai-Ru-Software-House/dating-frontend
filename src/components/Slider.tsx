/**
 * Slider.tsx
 * One-knob slider filled from the left, for the distance (design.md 3.5).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useState } from "react";

import { clamp, positionOf } from "../utils/slider";
import { SliderFrame } from "./SliderFrame";
import { SliderKnob } from "./SliderKnob";

/** Props for Slider. */
export interface SliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  /** Formats a value for the header and the end labels, for example "50 km". */
  format?: (value: number) => string;
}

/**
 * A one-knob slider.
 * @param props See SliderProps.
 * @returns The slider.
 */
export function Slider(props: SliderProps): React.JSX.Element {
  const { label, min, max, value, onChange, format = String } = props;
  const [trackWidth, setTrackWidth] = useState(0);
  const at = positionOf(value, trackWidth, min, max);
  const set = (next: number): void => {
    const clamped = clamp(Math.round(next), min, max);
    if (clamped !== value) {
      onChange(clamped);
    }
  };

  return (
    <SliderFrame
      label={label}
      valueText={format(value)}
      startLabel={format(min)}
      endLabel={format(max)}
      fillFrom={0}
      fillTo={at}
      onTrackWidth={setTrackWidth}
    >
      <SliderKnob
        value={value}
        left={at}
        pointsPerStep={max > min ? trackWidth / (max - min) : 0}
        onDrag={set}
        onStep={set}
        accessibilityLabel={label}
        min={min}
        max={max}
      />
    </SliderFrame>
  );
}
