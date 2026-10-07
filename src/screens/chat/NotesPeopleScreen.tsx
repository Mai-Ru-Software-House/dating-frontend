/**
 * NotesPeopleScreen.tsx
 * The Notes tab (design.md 6.13): people the user has notes about, favorites first, each with the
 * latest note's first line, its time and the note count. Search filters on the device.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { messageFor } from "../../api/errors";
import type { NotePerson } from "../../api/types";
import { EmptyState } from "../../components/EmptyState";
import { ListRow } from "../../components/ListRow";
import { LoadError } from "../../components/LoadError";
import { RowSkeleton } from "../../components/RowSkeleton";
import { Screen } from "../../components/Screen";
import { SearchBar } from "../../components/SearchBar";
import { SectionLabel } from "../../components/SectionLabel";
import { useFavorites } from "../../hooks/useFavorites";
import { useNotePeople } from "../../hooks/useNotes";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import type { NotesStackScreenProps } from "../../navigation/types";
import { colors, fonts, space, type } from "../../theme";
import { filterByName } from "../../utils/chatList";
import { firstLine, formatListTime, formatNoteCount } from "../../utils/format";
import { splitNotePeople } from "../../utils/notes";

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
  const all = query.data?.people ?? [];
  const isFallback = query.data?.isFallback ?? false;
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
      onPress={() => navigation.navigate("NotesInTab", person.user)}
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
            onPress: () => navigation.navigate("ChatsTab"),
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
          {sections.favorites.map((p) => row(p, true))}
        </View>
      ) : null}
      {sections.others.length > 0 ? (
        <View style={styles.section}>
          <SectionLabel label="Other people" />
          {sections.others.map((p) => row(p, false))}
        </View>
      ) : null}
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
  section: {
    marginTop: space.xl,
  },
  footer: {
    ...type.label,
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: "center",
    marginTop: space.xxl,
  },
});
