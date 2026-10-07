/**
 * MatchCard.tsx
 * The top recommendation card (design.md 3.14): photo, score pill, favorite button, and a scrim
 * band with name, age and place. Keeps the design's proportion, at most 420 pt high.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { MapPin } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";

import type { CandidateCard } from "../api/types";
import {
  colors,
  fonts,
  ICON_STROKE,
  matchCardHeight,
  PRESSED_OPACITY,
  radius,
  space,
  type,
} from "../theme";
import { formatDistance, formatNameAge } from "../utils/format";
import { formatPlace } from "../utils/place";
import { FavoriteButton } from "./FavoriteButton";
import { PhotoFill } from "./PhotoFill";
import { ScorePill } from "./ScorePill";

const SCRIM_HEIGHT = 110;

/** Props for MatchCard. */
export interface MatchCardProps {
  card: CandidateCard;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}

/**
 * The top match card.
 * @param props See MatchCardProps.
 * @returns The card.
 */
export function MatchCard({
  card,
  isFavorite,
  onToggleFavorite,
  onPress,
}: MatchCardProps): React.JSX.Element {
  const [width, setWidth] = useState(0);
  const place = formatPlace(card.placeName, "short");
  const distance = formatDistance(card.distanceKm, "card");
  const placeLine = place === null ? distance : `${place} · ${distance}`;
  const onLayout = (event: LayoutChangeEvent): void => setWidth(event.nativeEvent.layout.width);

  return (
    <Pressable
      onPress={onPress}
      onLayout={onLayout}
      accessibilityRole="button"
      accessibilityLabel={`${formatNameAge(card.displayName, card.age)}, ${placeLine}`}
      accessibilityHint="Opens the profile"
      style={({ pressed }) => [
        styles.card,
        { height: width > 0 ? matchCardHeight(width) : undefined },
        pressed && styles.pressed,
      ]}
    >
      <PhotoFill userId={card.userId} photoUrl={card.photoUrl} borderRadius={radius.hero} />
      <View style={styles.scrim}>
        <Text style={styles.name} numberOfLines={1}>
          {formatNameAge(card.displayName, card.age)}
        </Text>
        <View style={styles.placeRow}>
          <MapPin size={18} color={colors.white} strokeWidth={ICON_STROKE} />
          <Text style={styles.place} numberOfLines={1}>
            {placeLine}
          </Text>
        </View>
      </View>
      <View style={styles.top}>
        {card.matchScore === undefined ? <View /> : <ScorePill score={card.matchScore} isOnPhoto />}
        <FavoriteButton isFavorite={isFavorite} onPress={onToggleFavorite} isCircle />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 240,
    borderRadius: radius.hero,
    justifyContent: "flex-end",
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
  scrim: {
    minHeight: SCRIM_HEIGHT,
    backgroundColor: colors.scrim,
    borderBottomLeftRadius: radius.hero,
    borderBottomRightRadius: radius.hero,
    paddingHorizontal: space.xl,
    paddingVertical: space.lg,
    justifyContent: "center",
    gap: space.sm,
  },
  name: {
    ...type.cardName,
    color: colors.white,
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  place: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.white,
    flexShrink: 1,
  },
  top: {
    position: "absolute",
    top: space.lg,
    left: space.lg,
    right: space.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
