/**
 * RecommendedList.tsx
 * Matches, Recommended tab (design.md 6.8): the top match card, then "MORE FOR YOU" rows. Load more
 * loads the next 10 by offset at the list's end until hasMore is false; pull to refresh starts over.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useNavigation } from "@react-navigation/native";
import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { type ReactElement } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";

import { matchingApi } from "../../api/matching";
import type { RecommendationsPage } from "../../api/types";
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
import {
  colors,
  columnStyle,
  GUTTER,
  MATCH_CARD_MAX_HEIGHT,
  MATCH_CARD_RATIO,
  radius,
  space,
} from "../../theme";
import { dedupeCandidates, nextOffset, splitTopMatch } from "../../utils/recommendations";
import { CandidateRow } from "./CandidateRow";

/**
 * The loading, error and empty states above the list.
 * @param query The recommendations query.
 * @param cardCount How many cards are loaded.
 * @returns The state to show, or null when there are cards.
 */
function renderStatus(
  query: UseInfiniteQueryResult<InfiniteData<RecommendationsPage>>,
  cardCount: number,
): React.JSX.Element | null {
  if (query.isLoading) {
    return (
      <>
        <View style={styles.cardSkeleton} />
        <RowSkeleton />
      </>
    );
  }
  if (query.isError && query.data === undefined) {
    return (
      <LoadError
        message="Couldn't load your matches."
        onRetry={() => void query.refetch()}
        isRetrying={query.isFetching}
      />
    );
  }
  if (query.isSuccess && cardCount === 0) {
    return (
      <EmptyState
        title="No one fits your preferences yet."
        detail="Try a wider age range or distance."
      />
    );
  }
  return null;
}

/**
 * The Recommended list.
 * @param props.header The screen title and segmented control, scrolled with the list.
 * @returns The list.
 */
export function RecommendedList({ header }: { header: ReactElement }): React.JSX.Element {
  const navigation = useNavigation();
  const { isFavorite, toggle } = useFavorites();
  const query = useInfiniteQuery({
    queryKey: keys.recommendationsList,
    queryFn: ({ pageParam }) => matchingApi.getRecommendations(RECOMMENDATIONS_PAGE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last, pages) =>
      nextOffset(
        last.hasMore,
        pages.reduce((n, page) => n + page.recommendations.length, 0),
      ) ?? undefined,
  });
  useRefreshOnFocus(query.refetch);
  const cards = dedupeCandidates(query.data?.pages.flatMap((page) => page.recommendations) ?? []);
  const { card, rows } = splitTopMatch(cards);
  const isLoadingMore = query.isFetchingNextPage;
  const open = (userId: string): void => {
    navigation.navigate("CandidateProfile", { userId });
  };

  const loadMore = (): void => {
    if (query.isFetching || !query.hasNextPage) {
      return;
    }
    void query.fetchNextPage();
  };
  const pull = usePullRefresh(() => query.refetch());

  const top = (
    <View>
      {header}
      {renderStatus(query, cards.length)}
      {card !== null ? (
        <MatchCard
          card={card}
          isFavorite={isFavorite(card.userId)}
          onToggleFavorite={() => {
            toggle(card.userId);
          }}
          onPress={() => {
            open(card.userId);
          }}
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
          onPress={() => {
            open(item.userId);
          }}
        />
      )}
      ListHeaderComponent={top}
      ListFooterComponent={
        isLoadingMore ? <ActivityIndicator style={styles.more} color={colors.accent} /> : undefined
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
    aspectRatio: MATCH_CARD_RATIO,
    maxHeight: MATCH_CARD_MAX_HEIGHT,
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
