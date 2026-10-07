/**
 * HomeScreen.tsx
 * Home (design.md 6.7): greeting and date, the user's avatar (opens Profile), the menu tiles, and
 * unread messages grouped by sender. Refetches on focus and on pull to refresh.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useQuery } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { messageFor } from "../../api/errors";
import { matchingApi } from "../../api/matching";
import { Avatar } from "../../components/Avatar";
import { EmptyState } from "../../components/EmptyState";
import { ListRow } from "../../components/ListRow";
import { LoadError } from "../../components/LoadError";
import { RowSkeleton } from "../../components/RowSkeleton";
import { Screen } from "../../components/Screen";
import { SectionLabel } from "../../components/SectionLabel";
import { RECOMMENDATIONS_PAGE } from "../../constants/limits";
import { useFavorites } from "../../hooks/useFavorites";
import { useMe } from "../../hooks/useMe";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import { useUnread } from "../../hooks/useUnread";
import type { TabScreenProps } from "../../navigation/types";
import { keys } from "../../session/queryClient";
import { colors, space, type } from "../../theme";
import {
  formatChatsTile,
  formatHomeDate,
  formatListTime,
  formatMatchesTile,
} from "../../utils/format";
import { HomeMenu } from "./HomeMenu";

/**
 * The Home screen.
 * @param props.navigation Tab navigation (with the root stack as parent).
 * @returns The screen.
 */
export function HomeScreen({ navigation }: TabScreenProps<"HomeTab">): React.JSX.Element {
  const me = useMe().data;
  const unread = useUnread();
  const { isFavorite } = useFavorites();
  const matches = useQuery({
    queryKey: keys.recommendations(RECOMMENDATIONS_PAGE),
    queryFn: () => matchingApi.getRecommendations(RECOMMENDATIONS_PAGE),
  });
  const refresh = async (): Promise<void> => {
    await Promise.all([unread.refetch(), matches.refetch()]);
  };
  useRefreshOnFocus(refresh);
  const now = new Date();
  const matchesSubtitle = matches.data
    ? formatMatchesTile(matches.data.length, RECOMMENDATIONS_PAGE)
    : " ";

  return (
    <Screen isInTabs onRefresh={refresh}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
            Hi, {me?.displayName ?? ""}
          </Text>
          <Text style={styles.date}>{formatHomeDate(now)}</Text>
        </View>
        {me ? (
          <Pressable
            onPress={() => navigation.navigate("Profile")}
            accessibilityRole="button"
            accessibilityLabel="Open your profile"
            hitSlop={4}
          >
            <Avatar
              userId={me.userId}
              displayName={me.displayName}
              photoUrl={me.photoUrl}
              size={44}
            />
          </Pressable>
        ) : null}
      </View>
      <HomeMenu
        matchesSubtitle={matchesSubtitle}
        chatsSubtitle={formatChatsTile(unread.senderCount)}
        onMatches={() => navigation.navigate("MatchesTab", { segment: "recommended" })}
        onSearch={() => navigation.navigate("MatchesTab", { segment: "search" })}
        onChats={() => navigation.navigate("ChatsTab")}
        onNotes={() => navigation.navigate("NotesTab")}
      />
      <View style={styles.section}>
        <SectionLabel
          label="Unread messages"
          actionLabel="See all"
          onPress={() => navigation.navigate("ChatsTab")}
        />
        {unread.isLoading ? <RowSkeleton /> : null}
        {unread.error && !unread.isLoading ? (
          <LoadError message={messageFor(unread.error)} onRetry={() => void unread.refetch()} />
        ) : null}
        {!unread.isLoading && !unread.error && unread.groups.length === 0 ? (
          <EmptyState title="You're all caught up." />
        ) : null}
        {unread.groups.map((group) => (
          <ListRow
            key={group.sender.userId}
            user={group.sender}
            title={group.sender.displayName}
            subtitle={group.newestText}
            isFavorite={isFavorite(group.sender.userId)}
            isUnread
            right={{
              kind: "conversation",
              time: formatListTime(group.newestSentAt, now),
              unreadCount: group.count,
            }}
            onPress={() => navigation.navigate("Conversation", group.sender)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    paddingTop: space.xxxl,
    marginBottom: space.xxl,
  },
  greeting: {
    flex: 1,
  },
  title: {
    ...type.title,
    color: colors.ink,
  },
  date: {
    ...type.body,
    fontSize: 15,
    color: colors.muted,
    marginTop: space.xs,
  },
  section: {
    marginTop: space.xxxl,
  },
});
