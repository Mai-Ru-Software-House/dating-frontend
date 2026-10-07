/**
 * MatchesScreen.tsx
 * Matches tab (design.md 6.8, 6.9): the title and the Recommended | Search control above the chosen
 * tab. The chosen tab lives in the route params, so the Home tiles can open either one.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "../../components/Screen";
import { SegmentedControl } from "../../components/SegmentedControl";
import type { TabScreenProps } from "../../navigation/types";
import { colors, space, type } from "../../theme";
import { RecommendedList } from "./RecommendedList";
import { SearchPanel } from "./SearchPanel";

type Segment = "recommended" | "search";

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "search", label: "Search" },
];

/**
 * The Matches screen.
 * @param props Tab navigation and route.
 * @returns The screen.
 */
export function MatchesScreen({
  navigation,
  route,
}: TabScreenProps<"MatchesTab">): React.JSX.Element {
  const segment: Segment = route.params?.segment ?? "recommended";
  const header = (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">
        Matches
      </Text>
      <SegmentedControl
        segments={SEGMENTS}
        value={segment}
        onChange={(next) => navigation.setParams({ segment: next })}
      />
    </View>
  );
  return (
    <Screen isInTabs isScrollable={false} isPadded={false}>
      {segment === "recommended" ? (
        <RecommendedList header={header} />
      ) : (
        <SearchPanel header={header} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: space.xxxl,
    gap: space.xl,
    marginBottom: space.xl,
  },
  title: {
    ...type.title,
    color: colors.ink,
  },
});
