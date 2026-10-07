/**
 * SegmentedControl.tsx
 * Two or more segments in a pill track (design.md 3.4), used for Recommended / Search.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, MAX_FONT_SCALE, space } from "../theme";

const TRACK_HEIGHT = 44;
const SEGMENT_HEIGHT = 36;

/** Props for SegmentedControl. */
export interface SegmentedControlProps<T extends string> {
  segments: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * A segmented control.
 * @param props See SegmentedControlProps.
 * @returns The control.
 */
export function SegmentedControl<T extends string>(
  props: SegmentedControlProps<T>,
): React.JSX.Element {
  const { segments, value, onChange } = props;
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {segments.map((segment) => {
        const isActive = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            onPress={() => onChange(segment.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={[styles.segment, isActive && styles.active]}
          >
            <Text
              style={[styles.label, isActive ? styles.activeLabel : styles.inactiveLabel]}
              numberOfLines={1}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.chip,
    padding: space.xs,
  },
  segment: {
    flex: 1,
    height: SEGMENT_HEIGHT,
    borderRadius: SEGMENT_HEIGHT / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  active: {
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
  },
  activeLabel: {
    color: colors.ink,
    fontFamily: fonts.semibold,
  },
  inactiveLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
  },
});
