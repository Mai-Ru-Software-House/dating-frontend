/**
 * SearchPanel.tsx
 * Matches, Search tab (design.md 6.9): criteria pre-filled from the user's own preferences, a
 * Search button, then results nearest first. The criteria scroll away with the results.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react-native";
import { useState, type ReactElement } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { matchingApi } from "../../api/matching";
import type { SearchCriteria } from "../../api/types";
import { Button } from "../../components/Button";
import { ChipGroup } from "../../components/ChipGroup";
import { EmptyState } from "../../components/EmptyState";
import { LoadError } from "../../components/LoadError";
import { RangeSlider } from "../../components/RangeSlider";
import { RowSkeleton } from "../../components/RowSkeleton";
import { SectionLabel } from "../../components/SectionLabel";
import { Slider } from "../../components/Slider";
import {
  AGE_SLIDER_MAX,
  AGE_SLIDER_MIN,
  DEFAULT_MAX_AGE,
  DEFAULT_MIN_AGE,
  DEFAULT_RADIUS_KM,
  DISTANCE_SLIDER_MAX,
  DISTANCE_SLIDER_MIN,
  SEARCH_LIMIT,
} from "../../constants/limits";
import { chipToTargetGenders, targetGendersToChip, type TargetChip } from "../../constants/profile";
import { useFavorites } from "../../hooks/useFavorites";
import { useMe } from "../../hooks/useMe";
import { keys } from "../../session/queryClient";
import { colors, columnStyle, GUTTER, space } from "../../theme";
import { formatFoundCount } from "../../utils/format";
import { kmLabel, TARGET_OPTIONS } from "../account/PreferencesStep";
import { CandidateRow } from "./CandidateRow";

/**
 * The Search tab.
 * @param props.header The screen title and segmented control.
 * @returns The list with the criteria form as its header.
 */
export function SearchPanel({ header }: { header: ReactElement }): React.JSX.Element {
  const navigation = useNavigation();
  const prefs = useMe().data?.preferences;
  const { isFavorite } = useFavorites();
  const [chip, setChip] = useState<TargetChip>(() =>
    prefs ? (targetGendersToChip(prefs.targetGenders) ?? "Everyone") : "Women",
  );
  const [ages, setAges] = useState<[number, number]>(() => [
    prefs?.minAge ?? DEFAULT_MIN_AGE,
    Math.min(prefs?.maxAge ?? DEFAULT_MAX_AGE, AGE_SLIDER_MAX),
  ]);
  const [radius, setRadius] = useState(() =>
    Math.min(prefs?.radiusKm ?? DEFAULT_RADIUS_KM, DISTANCE_SLIDER_MAX),
  );
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);
  const query = useQuery({
    queryKey: keys.candidates(criteria ?? {}),
    queryFn: () => matchingApi.searchCandidates(criteria ?? {}),
    enabled: criteria !== null,
  });
  const results = query.data ?? [];

  const runSearch = (): void => {
    const next = {
      minAge: ages[0],
      maxAge: ages[1],
      targetGenders: chipToTargetGenders(chip),
      maxDistanceKm: radius,
      limit: SEARCH_LIMIT,
    };
    if (JSON.stringify(next) === JSON.stringify(criteria)) {
      void query.refetch();
    }
    setCriteria(next);
  };

  const form = (
    <View>
      {header}
      <ChipGroup label="Show me" options={TARGET_OPTIONS} value={chip} onChange={setChip} />
      <RangeSlider
        label="Age"
        min={AGE_SLIDER_MIN}
        max={AGE_SLIDER_MAX}
        value={ages}
        onChange={setAges}
        lowLabel="Minimum age"
        highLabel="Maximum age"
      />
      <Slider
        label="Within"
        min={DISTANCE_SLIDER_MIN}
        max={DISTANCE_SLIDER_MAX}
        value={radius}
        onChange={setRadius}
        format={kmLabel}
      />
      <Button label="Search" icon={Search} onPress={runSearch} isLoading={query.isFetching} />
      <View style={styles.results}>
        {query.isSuccess ? (
          <SectionLabel
            label={formatFoundCount(results.length, SEARCH_LIMIT)}
            hint="Nearest first"
            hintColor={colors.accent}
            isHintStrong
          />
        ) : null}
        {query.isLoading ? <RowSkeleton /> : null}
        {query.isError ? (
          <LoadError message="Couldn't load your matches." onRetry={() => void query.refetch()} />
        ) : null}
        {query.isSuccess && results.length === 0 ? (
          <EmptyState title="No one matches these filters." />
        ) : null}
      </View>
    </View>
  );

  return (
    <FlatList
      data={query.isError ? [] : results}
      keyExtractor={(item) => item.userId}
      renderItem={({ item }) => (
        <CandidateRow
          card={item}
          isFavorite={isFavorite(item.userId)}
          onPress={() => navigation.navigate("CandidateProfile", { userId: item.userId })}
        />
      )}
      ListHeaderComponent={form}
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
  results: {
    marginTop: space.xxl,
  },
});
