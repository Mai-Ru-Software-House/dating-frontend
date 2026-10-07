/**
 * BackButton.tsx
 * The 40 pt round back button (design.md 3.11): white with a line border, or plain white over
 * photos. The touch area is padded to 44 pt.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import { colors, ICON_STROKE, PRESSED_OPACITY, size } from "../theme";

/** Props for BackButton. */
export interface BackButtonProps {
  onPress: () => void;
  /** Over a photo: no border. */
  isOnPhoto?: boolean;
}

/**
 * A back button.
 * @param props.onPress Called on press.
 * @param props.isOnPhoto Borderless variant for photos.
 * @returns The button.
 */
export function BackButton({ onPress, isOnPhoto = false }: BackButtonProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={2}
      accessibilityRole="button"
      accessibilityLabel="Back"
      style={({ pressed }) => [
        styles.button,
        !isOnPhoto && styles.border,
        pressed && styles.pressed,
      ]}
    >
      <ChevronLeft size={size.iconSmall + 2} color={colors.ink} strokeWidth={ICON_STROKE} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: size.backButton,
    height: size.backButton,
    borderRadius: size.backButton / 2,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  border: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
});
