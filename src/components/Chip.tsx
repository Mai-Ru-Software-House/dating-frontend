/**
 * Chip.tsx
 * A single-choice chip (design.md 3.3): white with a border, or ink when selected.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts, MAX_FONT_SCALE, PRESSED_OPACITY, size, type } from "../theme";

/** Props for Chip. */
export interface ChipProps {
  /** The label. */
  label: string;
  /** Whether this chip is the chosen one. */
  isSelected: boolean;
  /** Called on press. */
  onPress: () => void;
  /** Not pressable. */
  isDisabled?: boolean;
}

/**
 * A chip.
 * @param props See ChipProps.
 * @returns The chip.
 */
export function Chip({
  label,
  isSelected,
  onPress,
  isDisabled = false,
}: ChipProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        isSelected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[styles.label, { color: isSelected ? colors.white : colors.ink }]}
        numberOfLines={1}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: size.chip,
    borderRadius: size.chip / 2,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  unselected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  selected: {
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  label: {
    ...type.rowSub,
    fontFamily: fonts.medium,
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
});
