/**
 * CandidateProfileScreen.tsx
 * Candidate profile (design.md 6.10): photo, name and age, score, place and distance, "Looking
 * for", and "Add favorite" / "Message". Sections without data are hidden.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useQuery } from "@tanstack/react-query";
import { MapPin, MessageSquare, Star } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { ERROR_COPY, messageFor, toApiError } from "../../api/errors";
import { profileApi } from "../../api/profile";
import { ActionBar } from "../../components/ActionBar";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { LoadError } from "../../components/LoadError";
import { ProfileLayout } from "../../components/ProfileLayout";
import { Screen } from "../../components/Screen";
import { ScorePill } from "../../components/ScorePill";
import { SectionLabel } from "../../components/SectionLabel";
import { TopBar } from "../../components/TopBar";
import { useFavorites } from "../../hooks/useFavorites";
import type { RootScreenProps } from "../../navigation/types";
import { keys } from "../../session/queryClient";
import { CANDIDATE_PHOTO, colors, ICON_STROKE, space, type } from "../../theme";
import { formatDistance, formatLookingFor, formatNameAge } from "../../utils/format";
import { formatPlace } from "../../utils/place";

/**
 * The candidate profile screen.
 * @param props Navigation and route ({ userId }).
 * @returns The screen.
 */
export function CandidateProfileScreen({
  navigation,
  route,
}: RootScreenProps<"CandidateProfile">): React.JSX.Element {
  const { userId } = route.params;
  const { isFavorite, toggle } = useFavorites();
  const query = useQuery({
    queryKey: keys.user(userId),
    queryFn: () => profileApi.getUser(userId),
  });
  const profile = query.data;

  if (profile === undefined) {
    const isGone = query.isError && toApiError(query.error).code === "USER_NOT_FOUND";
    return (
      <Screen header={<TopBar onBack={() => navigation.goBack()} />}>
        {query.isLoading ? (
          <ActivityIndicator style={styles.loading} color={colors.accent} />
        ) : null}
        {isGone ? (
          <EmptyState
            title={ERROR_COPY.USER_NOT_FOUND}
            action={{ label: "Go back", onPress: () => navigation.goBack(), variant: "secondary" }}
          />
        ) : null}
        {query.isError && !isGone ? (
          <LoadError message={messageFor(query.error)} onRetry={() => void query.refetch()} />
        ) : null}
      </Screen>
    );
  }

  const isFav = isFavorite(userId);
  const place = formatPlace(profile.placeName, "full");
  const distance = formatDistance(profile.distanceKm, "card");
  return (
    <ProfileLayout
      userId={profile.userId}
      photoUrl={profile.photoUrl}
      photoSize={CANDIDATE_PHOTO}
      onBack={() => navigation.goBack()}
      onRefresh={query.refetch}
      footer={
        <ActionBar>
          <Button
            label={isFav ? "Favorited" : "Add favorite"}
            variant="favorite"
            icon={Star}
            isIconFilled
            onPress={() => toggle(userId)}
            accessibilityLabel={isFav ? "Remove from favorites" : "Add to favorites"}
            isCompact
            style={styles.flex}
          />
          <Button
            label="Message"
            icon={MessageSquare}
            isCompact
            onPress={() =>
              navigation.navigate("Conversation", {
                userId,
                displayName: profile.displayName,
                photoUrl: profile.photoUrl,
              })
            }
            style={styles.flex}
          />
        </ActionBar>
      }
    >
      <View style={styles.nameRow}>
        <Text style={styles.name} accessibilityRole="header">
          {formatNameAge(profile.displayName, profile.age)}
        </Text>
        {profile.matchScore === undefined ? null : <ScorePill score={profile.matchScore} />}
      </View>
      <View style={styles.placeRow}>
        <MapPin size={18} color={colors.muted} strokeWidth={ICON_STROKE} />
        <Text style={styles.place} numberOfLines={1}>
          {place === null ? distance : `${place} · ${distance}`}
        </Text>
      </View>
      {profile.lookingFor ? (
        <View style={styles.section}>
          <SectionLabel label="Looking for" />
          <Text style={styles.body}>{formatLookingFor(profile.lookingFor)}</Text>
        </View>
      ) : null}
    </ProfileLayout>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loading: {
    marginTop: space.xxxl,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
  },
  name: {
    ...type.profileName,
    color: colors.ink,
    flexShrink: 1,
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: space.sm,
  },
  place: {
    ...type.body,
    color: colors.muted,
    flexShrink: 1,
  },
  section: {
    marginTop: space.xxl,
  },
  body: {
    ...type.body,
    fontSize: 16,
    color: colors.ink,
  },
});
