/**
 * SectionLabel.tsx
 * UPPERCASE section label with an optional leading star and right-side action (design.md 3.7).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Star } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, ICON_STROKE, space, type } from "../theme";

/** Props for SectionLabel. */
export interface SectionLabelProps {
  /** The label (shown upper case). */
  label: string;
  /** Lead with a star (FAVORITES). */
  hasStar?: boolean;
  /** Right-side action text ("See all"). Pressable when onPress is set. */
  actionLabel?: string;
  onPress?: () => void;
  /** Right-side plain hint ("Only you can see this", "Nearest first"). */
  hint?: string;
  /** Color of a plain right-side hint (default muted). */
  hintColor?: string;
  /** Hint in 13 pt semibold, like an action ("Score", "Nearest first"). */
  isHintStrong?: boolean;
}

/**
 * A section label.
 * @param props See SectionLabelProps.
 * @returns The label row.
 */
export function SectionLabel(props: SectionLabelProps): React.JSX.Element {
  const { label, hasStar = false, actionLabel, onPress, hint, hintColor = colors.muted } = props;
  const hintStyle = props.isHintStrong ? styles.action : styles.hint;
  return (
    <View style={styles.row}>
      <View style={styles.left} accessibilityRole="header">
        {hasStar ? (
          <Star size={13} color={colors.fav} fill={colors.fav} strokeWidth={ICON_STROKE} />
        ) : null}
        <Text style={styles.label} numberOfLines={1}>
          {label.toUpperCase()}
        </Text>
      </View>
      {actionLabel ? (
        <Pressable onPress={onPress} hitSlop={12} accessibilityRole="button">
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {hint ? <Text style={[hintStyle, { color: hintColor }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    marginBottom: space.sm,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  label: {
    ...type.section,
    color: colors.muted,
  },
  action: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: fonts.semibold,
    color: colors.accent,
  },
  hint: {
    ...type.caption,
  },
});
