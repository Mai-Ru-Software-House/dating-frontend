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
const OPACITIES = [0.9, 0.6, 0.35];

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
      Animated.timing(phase, { toValue: 3, duration: CYCLE_MS, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
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
        {OPACITIES.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: phase.interpolate({
                  inputRange: [0, 1, 2, 3],
                  outputRange: [0, 1, 2, 3].map((p) => OPACITIES[(index + p) % 3]),
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
