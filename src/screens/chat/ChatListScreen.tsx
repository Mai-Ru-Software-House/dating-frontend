/**
 * ChatListScreen.tsx
 * Chat list (design.md 6.11): on-device search by name, then "★ FAVORITES" and "ALL CHATS", both in
 * server order. Refetches on focus and pull to refresh.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { messageFor } from "../../api/errors";
import type { Conversation } from "../../api/types";
import { EmptyState } from "../../components/EmptyState";
import { ListRow } from "../../components/ListRow";
import { LoadError } from "../../components/LoadError";
import { RowSkeleton } from "../../components/RowSkeleton";
import { Screen } from "../../components/Screen";
import { SearchBar } from "../../components/SearchBar";
import { SectionLabel } from "../../components/SectionLabel";
import { useConversations } from "../../hooks/useConversations";
import { useFavorites } from "../../hooks/useFavorites";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import type { TabScreenProps } from "../../navigation/types";
import { useSession } from "../../session/SessionProvider";
import { colors, space, type } from "../../theme";
import { filterChats, splitChats } from "../../utils/chatList";
import { formatListTime, formatPreview } from "../../utils/format";

/**
 * The chat list screen.
 * @param props.navigation Tab navigation (with the root stack as parent).
 * @returns The screen.
 */
export function ChatListScreen({ navigation }: TabScreenProps<"ChatsTab">): React.JSX.Element {
  const { userId: myId } = useSession();
  const { favorites } = useFavorites();
  const query = useConversations();
  const [search, setSearch] = useState("");
  useRefreshOnFocus(query.refetch);
  const all = query.data ?? [];
  const sections = splitChats(filterChats(all, search), favorites);
  const now = new Date();

  const row = (c: Conversation, isFav: boolean): React.JSX.Element => (
    <ListRow
      key={c.user.userId}
      user={c.user}
      title={c.user.displayName}
      subtitle={formatPreview(c.lastMessage, myId)}
      isFavorite={isFav}
      isUnread={c.unreadCount > 0}
      right={{
        kind: "conversation",
        time: formatListTime(c.lastMessage.sentAt, now),
        unreadCount: c.unreadCount,
      }}
      onPress={() => navigation.navigate("Conversation", c.user)}
    />
  );

  return (
    <Screen isInTabs onRefresh={query.refetch}>
      <Text style={styles.title} accessibilityRole="header">
        Chats
      </Text>
      {all.length > 0 ? (
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search chats" />
      ) : null}
      <View style={styles.list}>
        {query.isLoading ? <RowSkeleton /> : null}
        {query.isError && query.data === undefined ? (
          <LoadError message={messageFor(query.error)} onRetry={() => void query.refetch()} />
        ) : null}
        {query.isSuccess && all.length === 0 ? (
          <EmptyState
            title="No chats yet. Find someone in Matches and say hi."
            action={{
              label: "Go to Matches",
              onPress: () => navigation.navigate("MatchesTab"),
              variant: "secondary",
            }}
          />
        ) : null}
        {all.length > 0 && sections.favorites.length + sections.others.length === 0 ? (
          <EmptyState title={`No one called "${search.trim()}".`} />
        ) : null}
        {sections.favorites.length > 0 ? (
          <View style={styles.section}>
            <SectionLabel label="Favorites" hasStar />
            {sections.favorites.map((c) => row(c, true))}
          </View>
        ) : null}
        {sections.others.length > 0 ? (
          <View style={styles.section}>
            <SectionLabel label="All chats" />
            {sections.others.map((c) => row(c, false))}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title,
    color: colors.ink,
    paddingTop: space.xxxl,
    marginBottom: space.xl,
  },
  list: {
    marginTop: space.sm,
  },
  section: {
    marginTop: space.xl,
  },
});
