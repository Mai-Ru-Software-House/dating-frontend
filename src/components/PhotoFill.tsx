/**
 * PhotoFill.tsx
 * Fills its box with a person's photo, or with their gradient and a white silhouette while the
 * photo loads or when it fails (the placeholder in designs 07, 09 and 19).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";

import { gradientFor, usePhotoSource } from "../hooks/usePhoto";
import { colors } from "../theme";

/** The placeholder silhouette: head size as a share of the smaller side, and its proportions. */
const HEAD_RATIO = 0.26;
const BODY_TO_HEAD_RATIO = 1.45;
const BODY_HEIGHT_RATIO = 0.42;
const NECK_GAP_RATIO = 0.2;

/** Props for PhotoFill. */
export interface PhotoFillProps {
  userId: string;
  photoUrl?: string | null;
  /** Corner radius, applied to the photo itself (Android doesn't draw images clipped by a parent). */
  borderRadius?: number;
}

/**
 * A full-bleed photo with a placeholder.
 * @param props.userId Picks the gradient.
 * @param props.photoUrl The photo path.
 * @param props.borderRadius Corner radius.
 * @returns The fill (absolutely positioned in its parent).
 */
export function PhotoFill({
  userId,
  photoUrl,
  borderRadius = 0,
}: PhotoFillProps): React.JSX.Element {
  const source = usePhotoSource(photoUrl);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const isPhotoShown = source !== null && failedUri !== source.uri;
  const onLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setBox({ width, height });
  };
  const head = Math.min(box.width, box.height) * HEAD_RATIO;
  const body = head * BODY_TO_HEAD_RATIO;

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} accessible={false}>
      <LinearGradient
        colors={gradientFor(userId)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      {box.width > 0 ? (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <View style={[styles.ghost, { width: head, height: head, borderRadius: head / 2 }]} />
          <View
            style={[
              styles.ghost,
              styles.body,
              {
                width: body,
                height: box.height * BODY_HEIGHT_RATIO,
                borderTopLeftRadius: body / 2,
              },
              { borderTopRightRadius: body / 2, marginTop: head * NECK_GAP_RATIO },
            ]}
          />
        </View>
      ) : null}
      {isPhotoShown ? (
        <Image
          source={source}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
          contentFit="cover"
          cachePolicy="disk"
          onError={() => {
            setFailedUri(source.uri);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  ghost: {
    backgroundColor: colors.photoGhost,
  },
  body: {
    marginBottom: 0,
  },
});
