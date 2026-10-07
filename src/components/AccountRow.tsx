/**
 * AccountRow.tsx
 * A remembered account on Switch user (design.md 3.21): avatar, display name over "@username",
 * and a chevron, or a "Remove" button in remove mode.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, ICON_STROKE, PRESSED_OPACITY, size, space, type } from "../theme";
import { Avatar } from "./Avatar";

/** Avatar size, and where the text (and the dividers) start. */
const AVATAR = 44;
export const ACCOUNT_ROW_TEXT_INSET = space.lg + AVATAR + space.lg;

/** Props for AccountRow. */
export interface AccountRowProps {
  userId: string;
  displayName: string;
  username: string;
  photoUrl: string;
  onPress: () => void;
  /** Show "Remove" instead of the chevron. */
  isRemoving?: boolean;
  onRemove?: () => void;
}

/**
 * An account row.
 * @param props See AccountRowProps.
 * @returns The row.
 */
export function AccountRow(props: AccountRowProps): React.JSX.Element {
  const { userId, displayName, username, photoUrl, onPress, isRemoving = false, onRemove } = props;
  return (
    <Pressable
      onPress={isRemoving ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}, @${username}`}
      accessibilityHint={isRemoving ? undefined : "Log in to this account"}
      style={({ pressed }) => [styles.row, pressed && !isRemoving && styles.pressed]}
    >
      <Avatar userId={userId} displayName={displayName} photoUrl={photoUrl} size={AVATAR} />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.username} numberOfLines={1}>
          @{username}
        </Text>
      </View>
      {isRemoving ? (
        <Pressable
          onPress={onRemove}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${username}`}
        >
          <Text style={styles.remove}>Remove</Text>
        </Pressable>
      ) : (
        <ChevronRight size={18} color={colors.muted} strokeWidth={ICON_STROKE} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: size.accountRow,
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
  text: {
    flex: 1,
  },
  name: {
    ...type.rowTitle,
    color: colors.ink,
  },
  username: {
    ...type.rowSub,
    color: colors.muted,
  },
  remove: {
    ...type.label,
    fontFamily: fonts.semibold,
    color: colors.accent,
  },
});
