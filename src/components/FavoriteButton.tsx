/**
 * FavoriteButton.tsx
 * Round star button: 44 pt white circle on photos (design.md 3.14), or a bare star in headers.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Star } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import { colors, ICON_STROKE, PRESSED_OPACITY, size } from "../theme";

/** Props for FavoriteButton. */
export interface FavoriteButtonProps {
  isFavorite: boolean;
  onPress: () => void;
  /** White circle (on photos); bare star otherwise. */
  isCircle?: boolean;
}

/**
 * A favorite toggle.
 * @param props See FavoriteButtonProps.
 * @returns The button.
 */
export function FavoriteButton({
  isFavorite,
  onPress,
  isCircle = false,
}: FavoriteButtonProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={isCircle ? 0 : 10}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
      accessibilityState={{ selected: isFavorite }}
      style={({ pressed }) => [isCircle ? styles.circle : styles.bare, pressed && styles.pressed]}
    >
      <Star
        size={size.icon}
        color={colors.fav}
        fill={isFavorite ? colors.fav : "none"}
        strokeWidth={ICON_STROKE}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: size.touch,
    height: size.touch,
    borderRadius: size.touch / 2,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  bare: {
    width: size.touch,
    height: size.touch,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
});
