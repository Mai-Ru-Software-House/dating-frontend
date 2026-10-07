/**
 * PhotoTile.tsx
 * The square 120 × 120 profile photo tile (design.md 6.5, 6.17): "Add photo" when empty, the photo
 * when picked, a spinner while uploading, and an optional camera badge.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Camera, Plus } from "lucide-react-native";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, ICON_STROKE, PRESSED_OPACITY, radius, size } from "../theme";
import { PhotoFill } from "./PhotoFill";

const BADGE = 36;

/** Props for PhotoTile. */
export interface PhotoTileProps {
  /** A photo picked on this phone. */
  localUri?: string | null;
  /** The saved photo, shown when nothing new was picked. */
  saved?: { userId: string; photoUrl: string } | null;
  isBusy?: boolean;
  onPress: () => void;
  /** Camera badge at the bottom right (Edit profile). */
  hasBadge?: boolean;
}

/**
 * A photo tile.
 * @param props See PhotoTileProps.
 * @returns The tile.
 */
export function PhotoTile({
  localUri,
  saved,
  isBusy = false,
  onPress,
  hasBadge = false,
}: PhotoTileProps): React.JSX.Element {
  const isEmpty = !localUri && !saved;
  return (
    <Pressable
      onPress={onPress}
      disabled={isBusy}
      accessibilityRole="button"
      accessibilityLabel={isEmpty ? "Add photo" : "Change photo"}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <View style={[styles.tile, isEmpty && styles.empty]}>
        {localUri ? (
          <Image source={{ uri: localUri }} style={styles.photo} resizeMode="cover" />
        ) : saved ? (
          <PhotoFill
            userId={saved.userId}
            photoUrl={saved.photoUrl}
            borderRadius={radius.photoTile}
          />
        ) : (
          <View style={styles.add}>
            <Plus size={size.icon} color={colors.accent} strokeWidth={ICON_STROKE} />
            <Text style={styles.addText}>Add photo</Text>
          </View>
        )}
        {isBusy ? (
          <View style={styles.busy}>
            <ActivityIndicator color={colors.white} />
          </View>
        ) : null}
      </View>
      {hasBadge ? (
        <View style={styles.badge}>
          <Camera size={18} color={colors.ink} strokeWidth={ICON_STROKE} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: size.photoTile,
    height: size.photoTile,
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
  // Round the children themselves: on Android an image inside a parent that clips with
  // overflow: hidden and rounded corners is not drawn.
  tile: {
    flex: 1,
    borderRadius: radius.photoTile,
  },
  photo: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.photoTile,
  },
  empty: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  add: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addText: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  busy: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.scrim,
    borderRadius: radius.photoTile,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: -8,
    bottom: -8,
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
});
