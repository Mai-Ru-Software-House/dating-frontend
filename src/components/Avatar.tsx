/**
 * Avatar.tsx
 * Round avatar (design.md 3.8): the photo, or the person's gradient with their initial while it
 * loads or when it fails.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { gradientFor, usePhotoSource } from "../hooks/usePhoto";
import { colors, fonts } from "../theme";
import { initialOf } from "../utils/avatar";

/** Props for Avatar. */
export interface AvatarProps {
  userId: string;
  displayName: string;
  photoUrl?: string | null;
  /** Diameter: 26, 40, 44 or 52. */
  size: number;
}

/**
 * A round avatar.
 * @param props See AvatarProps.
 * @returns The avatar.
 */
export function Avatar({ userId, displayName, photoUrl, size }: AvatarProps): React.JSX.Element {
  const source = usePhotoSource(photoUrl);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const showPhoto = source !== null && failedUri !== source.uri;
  const box = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.wrap, box]} accessibilityLabel={displayName} accessibilityRole="image">
      <LinearGradient
        colors={gradientFor(userId)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.center, { borderRadius: size / 2 }]}
      >
        <Text style={[styles.initial, { fontSize: size * 0.4 }]} allowFontScaling={false}>
          {initialOf(displayName)}
        </Text>
      </LinearGradient>
      {showPhoto ? (
        <Image
          testID="avatar-image"
          source={source}
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
          contentFit="cover"
          cachePolicy="disk"
          onError={() => setFailedUri(source.uri)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // No overflow: hidden: Android doesn't draw an image clipped by a rounded parent, so the
  // gradient and the photo are rounded themselves.
  wrap: {},
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    color: colors.white,
    fontFamily: fonts.semibold,
  },
});
