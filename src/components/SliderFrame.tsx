/**
 * SliderFrame.tsx
 * The shared parts of both sliders (design.md 3.5): header with label and value, the track, and
 * the end labels. The knobs are drawn by the caller through `children`.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { ReactNode } from "react";
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";

import { colors, fonts, space, type } from "../theme";
import { KNOB_SIZE } from "./SliderKnob";

const TRACK_HEIGHT = 4;

/** Props for SliderFrame. */
export interface SliderFrameProps {
  label: string;
  valueText: string;
  startLabel: string;
  endLabel: string;
  /** Filled part of the track: offsets from the usable track's start. */
  fillFrom: number;
  fillTo: number;
  /** Called with the usable track width (total minus one knob). */
  onTrackWidth: (width: number) => void;
  /** The knobs. */
  children: ReactNode;
}

/**
 * Slider header, track and end labels.
 * @param props See SliderFrameProps.
 * @returns The frame.
 */
export function SliderFrame(props: SliderFrameProps): React.JSX.Element {
  const { label, valueText, startLabel, endLabel, fillFrom, fillTo, onTrackWidth, children } =
    props;
  const onLayout = (event: LayoutChangeEvent): void => {
    onTrackWidth(Math.max(0, event.nativeEvent.layout.width - KNOB_SIZE));
  };
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{valueText}</Text>
      </View>
      <View style={styles.trackArea} onLayout={onLayout}>
        <View style={styles.track} />
        <View
          style={[
            styles.fill,
            { left: KNOB_SIZE / 2 + fillFrom, width: Math.max(0, fillTo - fillFrom) },
          ]}
        />
        {children}
      </View>
      <View style={styles.ends}>
        <Text style={styles.end}>{startLabel}</Text>
        <Text style={styles.end}>{endLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.lg,
  },
  label: {
    ...type.label,
    color: colors.muted,
  },
  value: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.semibold,
    color: colors.ink,
  },
  trackArea: {
    height: KNOB_SIZE,
    justifyContent: "center",
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.line,
    marginHorizontal: KNOB_SIZE / 2,
  },
  fill: {
    position: "absolute",
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.accent,
  },
  ends: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: space.sm,
  },
  end: {
    ...type.caption,
    color: colors.muted,
  },
});
