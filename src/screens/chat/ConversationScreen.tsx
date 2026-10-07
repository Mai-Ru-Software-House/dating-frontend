/**
 * ConversationScreen.tsx
 * Conversation (design.md 6.12): messages newest at the bottom with day dividers, groups and
 * "Seen"; older messages load at the top; long-press a bubble to reply. No live updates: it
 * refreshes on focus and after sending.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text } from "react-native";

import { messageFor } from "../../api/errors";
import type { MessageQuote } from "../../api/types";
import { Composer } from "../../components/Composer";
import { LoadError } from "../../components/LoadError";
import { MessageBubble } from "../../components/MessageBubble";
import { Screen } from "../../components/Screen";
import { TypingIndicator } from "../../components/TypingIndicator";
import { useFavorites } from "../../hooks/useFavorites";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import type { RootScreenProps } from "../../navigation/types";
import { useSession } from "../../session/SessionProvider";
import { colors, columnStyle, fonts, GUTTER, space, type } from "../../theme";
import { groupMessages } from "../../utils/groupMessages";
import { ConversationHeader } from "./ConversationHeader";
import { useConversationMessages } from "./useConversationMessages";

/**
 * The conversation screen.
 * @param props Navigation and route ({ userId, displayName, photoUrl }).
 * @returns The screen.
 */
export function ConversationScreen({
  navigation,
  route,
}: RootScreenProps<"Conversation">): React.JSX.Element {
  const other = route.params;
  const { userId: myId } = useSession();
  const { isFavorite, toggle } = useFavorites();
  const chat = useConversationMessages(other.userId, myId);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<MessageQuote | null>(null);
  useRefreshOnFocus(chat.refetch);
  const rows = groupMessages(chat.messages, myId, new Date());
  const nameOf = (senderId: string): string => (senderId === myId ? "You" : other.displayName);

  const send = (text: string): void => {
    chat.send(text, replyTo);
    setDraft("");
    setReplyTo(null);
  };

  return (
    <Screen
      hasTopInset={false}
      isScrollable={false}
      isPadded={false}
      header={
        <ConversationHeader
          other={other}
          isFavorite={isFavorite(other.userId)}
          onBack={() => navigation.goBack()}
          onToggleFavorite={() => toggle(other.userId)}
          onOpenNotes={() => navigation.navigate("Notes", other)}
        />
      }
      footer={
        <Composer
          value={draft}
          onChangeText={setDraft}
          onSend={send}
          replyTo={replyTo ? { name: nameOf(replyTo.senderId), text: replyTo.text } : null}
          onCancelReply={() => setReplyTo(null)}
        />
      }
    >
      {chat.isLoading ? <ActivityIndicator style={styles.loading} color={colors.accent} /> : null}
      {chat.error && rows.length === 0 ? (
        <LoadError message={messageFor(chat.error)} onRetry={() => void chat.refetch()} />
      ) : null}
      <FlatList
        inverted
        data={rows}
        keyExtractor={(row) => row.key}
        renderItem={({ item }) =>
          item.kind === "divider" ? (
            <Text style={styles.divider}>{item.label}</Text>
          ) : (
            <MessageBubble
              message={item.message}
              isMine={item.isMine}
              isGroupStart={item.isGroupStart}
              isGroupEnd={item.isGroupEnd}
              timeLabel={item.timeLabel}
              other={other}
              quotedName={item.message.replyTo ? nameOf(item.message.replyTo.senderId) : undefined}
              onLongPress={
                item.message.sendState
                  ? undefined
                  : () =>
                      setReplyTo({
                        messageId: item.message.messageId,
                        senderId: item.message.senderId,
                        text: item.message.text,
                      })
              }
              onRetry={
                item.message.clientId ? () => chat.retry(item.message.clientId ?? "") : undefined
              }
            />
          )
        }
        ListHeaderComponent={<TypingIndicator other={other} />}
        ListFooterComponent={
          chat.isLoadingOlder ? (
            <ActivityIndicator style={styles.older} color={colors.accent} />
          ) : null
        }
        onEndReached={chat.loadOlder}
        onEndReachedThreshold={0.3}
        contentContainerStyle={[columnStyle, styles.content]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: space.xxxl,
  },
  content: {
    paddingHorizontal: GUTTER,
    paddingVertical: space.lg,
  },
  divider: {
    ...type.caption,
    fontFamily: fonts.semibold,
    color: colors.muted,
    textAlign: "center",
    marginTop: space.xxl,
  },
  older: {
    paddingVertical: space.lg,
  },
});
