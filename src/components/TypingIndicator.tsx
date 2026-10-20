/**
 * TypingIndicator.tsx
 * Three cycling dots in a chip pill next to a 26 pt avatar (design.md 3.16). Not wired in v1: the
 * API has no typing status, so it only renders when FEATURES.typingIndicator is on.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

import type { UserSummary } from "../api/types";
import { FEATURES } from "../constants/features";
import { colors, space } from "../theme";
import { Avatar } from "./Avatar";

const CYCLE_MS = 1200;
const DOT = 8;
const OPACITY_STRONG = 0.9;
const OPACITY_MEDIUM = 0.6;
const OPACITY_FAINT = 0.35;
const OPACITIES = [OPACITY_STRONG, OPACITY_MEDIUM, OPACITY_FAINT];
/** The animation runs 0 to one step per dot; each dot reads the opacity list from its own offset. */
const PHASE_STEPS = [0, 1, 2, OPACITIES.length];

/** Props for TypingIndicator. */
export interface TypingIndicatorProps {
  other: UserSummary;
}

/**
 * The typing indicator.
 * @param props.other The person typing.
 * @returns The indicator, or null while the feature is off.
 */
export function TypingIndicator({ other }: TypingIndicatorProps): React.JSX.Element | null {
  const [phase] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(phase, {
        toValue: OPACITIES.length,
        duration: CYCLE_MS,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [phase]);

  if (!FEATURES.typingIndicator) {
    return null;
  }
  return (
    <View style={styles.row} accessibilityLabel={`${other.displayName} is typing`}>
      <Avatar
        userId={other.userId}
        displayName={other.displayName}
        photoUrl={other.photoUrl}
        size={26}
      />
      <View style={styles.pill}>
        {OPACITIES.map((opacity, index) => (
          <Animated.View
            key={opacity}
            style={[
              styles.dot,
              {
                opacity: phase.interpolate({
                  inputRange: PHASE_STEPS,
                  outputRange: PHASE_STEPS.map((p) => OPACITIES[(index + p) % OPACITIES.length]),
                }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.sm,
    marginTop: 26,
  },
  pill: {
    width: 60,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.chip,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.muted,
  },
});
