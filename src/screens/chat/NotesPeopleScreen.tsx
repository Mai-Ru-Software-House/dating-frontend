/**
 * NotesPeopleScreen.tsx
 * The Notes tab (design.md 6.13): people the user has notes about, favorites first, each with the
 * latest note's first line, its time and the note count. Search filters on the device.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { messageFor } from "../../api/errors";
import type { NotePerson } from "../../api/types";
import { EmptyState } from "../../components/EmptyState";
import { ListRow } from "../../components/ListRow";
import { ListSection } from "../../components/ListSection";
import { LoadError } from "../../components/LoadError";
import { RowSkeleton } from "../../components/RowSkeleton";
import { Screen } from "../../components/Screen";
import { SearchBar } from "../../components/SearchBar";
import { useFavorites } from "../../hooks/useFavorites";
import { useNotePeople, type NotePeopleResult } from "../../hooks/useNotes";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import type { NotesStackScreenProps } from "../../navigation/types";
import { colors, fonts, space, type } from "../../theme";
import { filterByName } from "../../utils/chatList";
import { firstLine, formatListTime, formatNoteCount } from "../../utils/format";
import { splitNotePeople } from "../../utils/notes";

/**
 * The people to list and whether the list is the fallback built from the chat list.
 * @param data The Notes people query result, if loaded.
 * @returns The people (none while loading) and the fallback flag.
 */
function peopleOf(data: NotePeopleResult | undefined): NotePeopleResult {
  return { people: data?.people ?? [], isFallback: data?.isFallback ?? false };
}

/**
 * The Notes tab screen.
 * @param props.navigation The Notes stack navigation.
 * @returns The screen.
 */
export function NotesPeopleScreen({
  navigation,
}: NotesStackScreenProps<"NotesPeople">): React.JSX.Element {
  const { favorites } = useFavorites();
  const query = useNotePeople();
  const [search, setSearch] = useState("");
  useRefreshOnFocus(query.refetch);
  const { people: all, isFallback } = peopleOf(query.data);
  const sections = splitNotePeople(
    filterByName(all, (p) => p.user.displayName, search),
    favorites,
  );
  const now = new Date();

  const row = (person: NotePerson, isFav: boolean): React.JSX.Element => (
    <ListRow
      key={person.user.userId}
      user={person.user}
      title={person.user.displayName}
      subtitle={isFallback ? "" : firstLine(person.lastNote.text)}
      isFavorite={isFav}
      right={{
        kind: "person",
        time: isFallback
          ? ""
          : formatListTime(person.lastNote.updatedAt ?? person.lastNote.createdAt, now),
        countLabel: isFallback ? "" : formatNoteCount(person.noteCount),
      }}
      onPress={() => {
        navigation.navigate("NotesInTab", person.user);
      }}
    />
  );

  return (
    <Screen isInTabs onRefresh={query.refetch}>
      <Text style={styles.title} accessibilityRole="header">
        Notes
      </Text>
      {all.length > 0 ? (
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search people" />
      ) : null}
      {query.isLoading ? <RowSkeleton /> : null}
      {query.isError && query.data === undefined ? (
        <LoadError message={messageFor(query.error)} onRetry={() => void query.refetch()} />
      ) : null}
      {query.isSuccess && all.length === 0 ? (
        <EmptyState
          title="No notes yet."
          detail="Open a chat and tap the note icon to write about someone."
          action={{
            label: "Go to Chats",
            onPress: () => {
              navigation.navigate("ChatsTab");
            },
            variant: "secondary",
          }}
        />
      ) : null}
      {all.length > 0 && sections.favorites.length + sections.others.length === 0 ? (
        <EmptyState title={`No one called "${search.trim()}".`} />
      ) : null}
      <ListSection
        label="Favorites"
        hasStar
        items={sections.favorites}
        renderItem={(p) => row(p, true)}
      />
      <ListSection label="Other people" items={sections.others} renderItem={(p) => row(p, false)} />
      {all.length > 0 ? <Text style={styles.footer}>Only you can see your notes.</Text> : null}
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
  footer: {
    ...type.label,
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: "center",
    marginTop: space.xxl,
  },
});
