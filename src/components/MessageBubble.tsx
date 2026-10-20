/**
 * MessageBubble.tsx
 * One chat bubble (design.md 3.15): mine on the right in accent, theirs on the left with an avatar
 * column; the time (and "Seen") under the last bubble of a group; a quoted strip for replies; a
 * dimmed pending state and a "Not sent. Tap to retry." line when sending failed.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import type { UserSummary } from "../api/types";
import { colors, fonts, MAX_CONTENT_WIDTH, space, type } from "../theme";
import { firstLine } from "../utils/format";
import type { ChatMessage } from "../utils/groupMessages";
import { Avatar } from "./Avatar";

const BUBBLE_RADIUS = 19;
const AVATAR_COLUMN = 34;
const GROUP_GAP = 26;
const BUBBLE_GAP = 4;
const BUBBLE_MAX_SHARE = 0.75;

/** Props for MessageBubble. */
export interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  isGroupStart: boolean;
  isGroupEnd: boolean;
  timeLabel: string;
  /** The other person, for the avatar. */
  other: UserSummary;
  /** Name of the quoted message's sender, when this is a reply. */
  quotedName?: string;
  /** Long press opens the reply action. */
  onLongPress?: () => void;
  /** Retry a failed send. */
  onRetry?: () => void;
}

/**
 * The avatar column on the left of their bubbles; the avatar shows on the last bubble of a group.
 * @param other The other person.
 * @param isGroupEnd Whether this is the last bubble of its group.
 * @returns The column.
 */
function renderAvatarColumn(other: UserSummary, isGroupEnd: boolean): React.JSX.Element {
  return (
    <View style={styles.avatarColumn}>
      {isGroupEnd ? (
        <Avatar
          userId={other.userId}
          displayName={other.displayName}
          photoUrl={other.photoUrl}
          size={26}
        />
      ) : null}
    </View>
  );
}

/**
 * The quoted strip above a reply.
 * @param replyTo The quoted message's text, when this message is a reply.
 * @param quotedName The quoted sender's name.
 * @param isMine Whether the bubble is mine (accent fill).
 * @returns The strip, or null when the message is not a reply.
 */
function renderQuote(
  replyTo: ChatMessage["replyTo"],
  quotedName: string | undefined,
  isMine: boolean,
): React.JSX.Element | null {
  if (!replyTo) {
    return null;
  }
  return (
    <View style={[styles.quote, isMine ? styles.quoteMine : styles.quoteTheirs]}>
      <Text style={[styles.quoteName, isMine && styles.onAccent]} numberOfLines={1}>
        {quotedName ?? ""}
      </Text>
      <Text style={[styles.quoteText, isMine && styles.onAccent]} numberOfLines={1}>
        {firstLine(replyTo.text)}
      </Text>
    </View>
  );
}

/**
 * The line under a bubble: the retry prompt when sending failed, else the time on the last bubble
 * of a group.
 * @param props The bubble's props.
 * @returns The line, or null.
 */
function renderMeta(props: MessageBubbleProps): React.JSX.Element | null {
  const { message, isMine, isGroupEnd, timeLabel } = props;
  if (message.sendState === "failed") {
    return (
      <Pressable onPress={props.onRetry} accessibilityRole="button" style={styles.metaMine}>
        <Text style={styles.failed}>Not sent. Tap to retry.</Text>
      </Pressable>
    );
  }
  if (isGroupEnd && timeLabel !== "" && message.sendState !== "pending") {
    return (
      <Text style={[styles.time, isMine ? styles.metaMine : styles.metaTheirs]}>{timeLabel}</Text>
    );
  }
  return null;
}

/**
 * A chat bubble.
 * @param props See MessageBubbleProps.
 * @returns The bubble row.
 */
export function MessageBubble(props: MessageBubbleProps): React.JSX.Element {
  const { message, isMine, isGroupStart, isGroupEnd, other, quotedName } = props;
  const isPending = message.sendState === "pending";
  const isFailed = message.sendState === "failed";
  const window = useWindowDimensions();
  // 75 % of the screen (design.md 3.15), measured against the 600 pt column on wide screens.
  const maxWidth = BUBBLE_MAX_SHARE * Math.min(window.width, MAX_CONTENT_WIDTH);
  return (
    <View style={[styles.wrap, { marginTop: isGroupStart ? GROUP_GAP : BUBBLE_GAP }]}>
      <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
        {isMine ? null : renderAvatarColumn(other, isGroupEnd)}
        <Pressable
          onLongPress={props.onLongPress}
          onPress={isFailed ? props.onRetry : undefined}
          delayLongPress={350}
          accessibilityRole={isFailed ? "button" : undefined}
          accessibilityHint={props.onLongPress ? "Long press to reply" : undefined}
          style={[
            styles.bubble,
            { maxWidth },
            isMine ? styles.mine : styles.theirs,
            isPending && styles.pending,
          ]}
        >
          {renderQuote(message.replyTo, quotedName, isMine)}
          <Text style={[styles.text, isMine ? styles.onAccent : styles.onSurface]}>
            {message.text}
          </Text>
        </Pressable>
      </View>
      {renderMeta(props)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  rowMine: {
    justifyContent: "flex-end",
  },
  rowTheirs: {
    justifyContent: "flex-start",
  },
  avatarColumn: {
    width: AVATAR_COLUMN,
  },
  bubble: {
    minHeight: 38,
    borderRadius: BUBBLE_RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 8.5,
    justifyContent: "center",
  },
  mine: {
    backgroundColor: colors.accent,
  },
  theirs: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pending: {
    opacity: 0.5,
  },
  text: {
    ...type.body,
  },
  onAccent: {
    color: colors.white,
  },
  onSurface: {
    color: colors.ink,
  },
  quote: {
    borderLeftWidth: 2,
    paddingLeft: space.sm,
    marginBottom: space.xs,
  },
  quoteMine: {
    borderLeftColor: colors.white,
  },
  quoteTheirs: {
    borderLeftColor: colors.accent,
  },
  quoteName: {
    ...type.caption,
    fontFamily: fonts.semibold,
    color: colors.ink,
  },
  quoteText: {
    ...type.caption,
    color: colors.muted,
  },
  time: {
    ...type.meta,
    color: colors.muted,
    marginTop: space.xs,
  },
  metaMine: {
    alignSelf: "flex-end",
  },
  metaTheirs: {
    marginLeft: AVATAR_COLUMN,
  },
  failed: {
    ...type.meta,
    color: colors.accent,
    marginTop: space.xs,
  },
});
