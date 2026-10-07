/**
 * ConversationHeader.tsx
 * The white conversation header (design.md 6.12): back, avatar, name, favorite star and the note
 * icon. It draws behind the status bar itself.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { ChevronLeft, FileText } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { UserSummary } from "../../api/types";
import { Avatar } from "../../components/Avatar";
import { FavoriteButton } from "../../components/FavoriteButton";
import { colors, columnStyle, ICON_STROKE, size, space, type } from "../../theme";

/** Props for ConversationHeader. */
export interface ConversationHeaderProps {
  other: UserSummary;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onOpenNotes: () => void;
}

/**
 * The conversation header.
 * @param props See ConversationHeaderProps.
 * @returns The header.
 */
export function ConversationHeader(props: ConversationHeaderProps): React.JSX.Element {
  const { other, isFavorite, onBack, onToggleFavorite, onOpenNotes } = props;
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <View style={[columnStyle, styles.row]}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          style={styles.icon}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft size={size.icon + 4} color={colors.ink} strokeWidth={ICON_STROKE} />
        </Pressable>
        <Avatar
          userId={other.userId}
          displayName={other.displayName}
          photoUrl={other.photoUrl}
          size={40}
        />
        <Text style={styles.name} numberOfLines={1} accessibilityRole="header">
          {other.displayName}
        </Text>
        <FavoriteButton isFavorite={isFavorite} onPress={onToggleFavorite} />
        <Pressable
          onPress={onOpenNotes}
          style={styles.icon}
          accessibilityRole="button"
          accessibilityLabel="Open notes"
        >
          <FileText size={size.icon} color={colors.ink} strokeWidth={ICON_STROKE} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  row: {
    height: size.topBar + space.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    gap: space.sm,
  },
  icon: {
    width: size.touch,
    height: size.touch,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    ...type.navTitle,
    fontSize: 18,
    color: colors.ink,
    flex: 1,
  },
});
