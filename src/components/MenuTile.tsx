/**
 * MenuTile.tsx
 * Home menu tile (design.md 3.13): tinted icon square, title and subtitle.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, ICON_STROKE, PRESSED_OPACITY, radius, size, space, type } from "../theme";

const TINT_SIZE = 38;

/** Props for MenuTile. */
export interface MenuTileProps {
  icon: LucideIcon;
  tint: { bg: string; fg: string };
  title: string;
  subtitle: string;
  onPress: () => void;
}

/**
 * A menu tile.
 * @param props See MenuTileProps.
 * @returns The tile.
 */
export function MenuTile({
  icon: Icon,
  tint,
  title,
  subtitle,
  onPress,
}: MenuTileProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}`}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <View style={[styles.tint, { backgroundColor: tint.bg }]}>
        <Icon size={size.iconSmall} color={tint.fg} strokeWidth={ICON_STROKE} />
      </View>
      <View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 108,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: space.md + 2,
    justifyContent: "space-between",
    gap: space.sm,
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
  tint: {
    width: TINT_SIZE,
    height: TINT_SIZE,
    borderRadius: radius.small,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...type.tileTitle,
    color: colors.ink,
  },
  subtitle: {
    ...type.caption,
    color: colors.muted,
  },
});
