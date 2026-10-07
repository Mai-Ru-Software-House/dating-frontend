/**
 * RecommendedList.tsx
 * Matches, Recommended tab (design.md 6.8): the top match card, then "MORE FOR YOU" rows. Load more
 * asks again with a bigger limit (10 → 50) at the list's end; pull to refresh starts over at 10.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useNavigation } from "@react-navigation/native";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState, type ReactElement } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";

import { matchingApi } from "../../api/matching";
import { EmptyState } from "../../components/EmptyState";
import { LoadError } from "../../components/LoadError";
import { MatchCard } from "../../components/MatchCard";
import { RowSkeleton } from "../../components/RowSkeleton";
import { SectionLabel } from "../../components/SectionLabel";
import { RECOMMENDATIONS_PAGE } from "../../constants/limits";
import { useFavorites } from "../../hooks/useFavorites";
import { usePullRefresh } from "../../hooks/usePullRefresh";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import { keys } from "../../session/queryClient";
import { colors, columnStyle, GUTTER, radius, space } from "../../theme";
import { dedupeCandidates, nextLimit, splitTopMatch } from "../../utils/recommendations";
import { CandidateRow } from "./CandidateRow";

/**
 * The Recommended list.
 * @param props.header The screen title and segmented control, scrolled with the list.
 * @returns The list.
 */
export function RecommendedList({ header }: { header: ReactElement }): React.JSX.Element {
  const navigation = useNavigation();
  const { isFavorite, toggle } = useFavorites();
  const [limit, setLimit] = useState(RECOMMENDATIONS_PAGE);
  const query = useQuery({
    queryKey: keys.recommendations(limit),
    queryFn: () => matchingApi.getRecommendations(limit),
    placeholderData: keepPreviousData,
  });
  useRefreshOnFocus(query.refetch);
  const cards = dedupeCandidates(query.data ?? []);
  const { card, rows } = splitTopMatch(cards);
  const isLoadingMore = query.isFetching && query.isPlaceholderData;
  const open = (userId: string): void => navigation.navigate("CandidateProfile", { userId });

  const loadMore = (): void => {
    if (query.isFetching || query.data === undefined) {
      return;
    }
    const next = nextLimit(limit, query.data.length);
    if (next !== null) {
      setLimit(next);
    }
  };
  const pull = usePullRefresh(() => {
    if (limit === RECOMMENDATIONS_PAGE) {
      return query.refetch();
    }
    setLimit(RECOMMENDATIONS_PAGE);
    return undefined;
  });

  const top = (
    <View>
      {header}
      {query.isLoading ? (
        <>
          <View style={styles.cardSkeleton} />
          <RowSkeleton />
        </>
      ) : null}
      {query.isError && query.data === undefined ? (
        <LoadError
          message="Couldn't load your matches."
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : null}
      {query.isSuccess && cards.length === 0 ? (
        <EmptyState
          title="No one fits your preferences yet."
          detail="Try a wider age range or distance."
        />
      ) : null}
      {card !== null ? (
        <MatchCard
          card={card}
          isFavorite={isFavorite(card.userId)}
          onToggleFavorite={() => toggle(card.userId)}
          onPress={() => open(card.userId)}
        />
      ) : null}
      {rows.length > 0 ? (
        <View style={styles.label}>
          <SectionLabel label="More for you" hint="Score" hintColor={colors.accent} isHintStrong />
        </View>
      ) : null}
    </View>
  );

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => item.userId}
      renderItem={({ item }) => (
        <CandidateRow
          card={item}
          isFavorite={isFavorite(item.userId)}
          onPress={() => open(item.userId)}
        />
      )}
      ListHeaderComponent={top}
      ListFooterComponent={
        isLoadingMore ? <ActivityIndicator style={styles.more} color={colors.accent} /> : null
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl
          refreshing={pull.isPulling}
          onRefresh={pull.onPull}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
      contentContainerStyle={[columnStyle, styles.content]}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: GUTTER,
    paddingBottom: space.xxl,
  },
  cardSkeleton: {
    width: "100%",
    aspectRatio: 353 / 330,
    maxHeight: 420,
    borderRadius: radius.hero,
    backgroundColor: colors.chip,
    marginBottom: space.xxl,
  },
  label: {
    marginTop: space.xxl,
  },
  more: {
    paddingVertical: space.lg,
  },
});
