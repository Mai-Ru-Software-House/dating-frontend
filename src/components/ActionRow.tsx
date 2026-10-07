/**
 * ActionRow.tsx
 * Pressable row in a ListGroup (design.md 3.21): icon, label, optional chevron; a destructive
 * variant in accent.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts, ICON_STROKE, PRESSED_OPACITY, size, space } from "../theme";

/** Where the label starts, which is also where a ListGroup's dividers start. */
export const ACTION_ROW_TEXT_INSET = 50;

/** Props for ActionRow. */
export interface ActionRowProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  /** Accent icon and label, no chevron. */
  isDestructive?: boolean;
}

/**
 * An action row.
 * @param props See ActionRowProps.
 * @returns The row.
 */
export function ActionRow({
  icon: Icon,
  label,
  onPress,
  isDestructive = false,
}: ActionRowProps): React.JSX.Element {
  const color = isDestructive ? colors.accent : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Icon size={22} color={color} strokeWidth={ICON_STROKE} />
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
      {isDestructive ? null : (
        <ChevronRight size={18} color={colors.muted} strokeWidth={ICON_STROKE} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: size.infoRow,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: space.lg,
    paddingRight: space.lg,
    gap: ACTION_ROW_TEXT_INSET - space.lg - 22,
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
  label: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.medium,
  },
});
