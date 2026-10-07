/**
 * ScorePill.tsx
 * Match score pill (design.md 3.9): "92%" on accentSoft, or on white over a photo.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, MAX_FONT_SCALE } from "../theme";
import { formatScore } from "../utils/format";

const HEIGHT = 26;

/** Props for ScorePill. */
export interface ScorePillProps {
  /** 0 to 100. */
  score: number;
  /** White fill, for use on a photo. */
  isOnPhoto?: boolean;
}

/**
 * A score pill.
 * @param props.score The match score.
 * @param props.isOnPhoto White fill on photos.
 * @returns The pill.
 */
export function ScorePill({ score, isOnPhoto = false }: ScorePillProps): React.JSX.Element {
  return (
    <View
      style={[styles.pill, { backgroundColor: isOnPhoto ? colors.surface : colors.accentSoft }]}
      accessible
      accessibilityLabel={`${formatScore(score)} match`}
    >
      <Text style={styles.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {formatScore(score)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: HEIGHT,
    minWidth: 58,
    borderRadius: HEIGHT / 2,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: fonts.bold,
    color: colors.accent,
  },
});
