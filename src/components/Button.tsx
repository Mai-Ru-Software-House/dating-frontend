/**
 * Button.tsx
 * The pill button (design.md 3.1): primary, secondary, favorite, danger and text variants, a small
 * size, an optional leading icon, and pressed, disabled and loading states. The label stays on one
 * line and shrinks to fit rather than being cut (design.md 2.6: check at 320 pt and 1.3×).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  colors,
  DISABLED_OPACITY,
  ICON_STROKE,
  MAX_FONT_SCALE,
  PRESSED_OPACITY,
  size,
  space,
  type,
} from "../theme";

/** Button look. */
export type ButtonVariant = "primary" | "secondary" | "favorite" | "danger" | "text";

/** Props for Button. */
export interface ButtonProps {
  /** The label. */
  label: string;
  /** Called on press. Not called while disabled or loading. */
  onPress: () => void;
  /** Look (default primary). */
  variant?: ButtonVariant;
  /** 36 pt high instead of 52 (note Save). */
  isSmall?: boolean;
  /** Optional leading icon. */
  icon?: LucideIcon;
  /** Fill the leading icon (the favorite star when on). */
  isIconFilled?: boolean;
  /** Not pressable, at 40 % opacity. */
  isDisabled?: boolean;
  /** Shows a spinner instead of the label, keeping the width; not pressable. */
  isLoading?: boolean;
  /** Tight side padding, for narrow buttons (dialogs, two buttons side by side on a profile). */
  isCompact?: boolean;
  /** Extra style, for example flex: 1 in a row. */
  style?: StyleProp<ViewStyle>;
  /** Screen reader label when it differs from the label. */
  accessibilityLabel?: string;
  /** Screen reader hint. */
  accessibilityHint?: string;
}

const LOOKS: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.accent, fg: colors.white },
  secondary: { bg: colors.surface, fg: colors.ink, border: colors.line },
  favorite: { bg: colors.favSoft, fg: colors.favInk },
  danger: { bg: colors.surface, fg: colors.accent, border: colors.line },
  text: { bg: "transparent", fg: colors.accent },
};

/**
 * A pill button.
 * @param props See ButtonProps.
 * @returns The button.
 */
export function Button(props: ButtonProps): React.JSX.Element {
  const {
    label,
    onPress,
    variant = "primary",
    isSmall = false,
    icon: Icon,
    isIconFilled = false,
    isDisabled = false,
    isLoading = false,
    isCompact = false,
    style,
    accessibilityLabel,
    accessibilityHint,
  } = props;
  const look = LOOKS[variant];
  const height = isSmall ? size.buttonSmall : size.button;
  const isInactive = isDisabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: isLoading }}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: look.bg,
          borderWidth: look.border === undefined ? 0 : 1,
          borderColor: look.border,
          paddingHorizontal: isCompact ? space.sm : isSmall ? space.lg : space.xl,
        },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={[styles.content, isLoading && styles.hidden]}>
        {Icon ? (
          <Icon
            size={size.iconSmall}
            color={look.fg}
            strokeWidth={ICON_STROKE}
            fill={isIconFilled ? look.fg : "none"}
          />
        ) : null}
        <Text
          style={[styles.label, isSmall && styles.smallLabel, { color: look.fg }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {label}
        </Text>
      </View>
      {isLoading ? <ActivityIndicator style={styles.spinner} color={look.fg} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    ...type.button,
    flexShrink: 1,
  },
  smallLabel: {
    fontSize: 14,
    lineHeight: 18,
  },
  hidden: {
    opacity: 0,
  },
  spinner: {
    position: "absolute",
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
});
