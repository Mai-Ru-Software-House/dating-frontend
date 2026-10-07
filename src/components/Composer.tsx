/**
 * Composer.tsx
 * The message bar (design.md 3.17): a growing pill input and a round send button, disabled while
 * the trimmed text is empty or over 1000 characters. Shows the quoted message while replying.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Send, X } from "lucide-react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useKeyboardVisible } from "../hooks/useKeyboardVisible";
import {
  colors,
  columnStyle,
  DISABLED_OPACITY,
  fonts,
  GUTTER,
  ICON_STROKE,
  size,
  space,
  type,
} from "../theme";
import { firstLine } from "../utils/format";
import { messageRule, ruleMessage } from "../utils/rules";

const MAX_LINES_HEIGHT = 4 * 21 + 24;

/** The message being replied to. */
export interface ComposerReply {
  name: string;
  text: string;
}

/** Props for Composer. */
export interface ComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  /** Called with the trimmed text. */
  onSend: (text: string) => void;
  replyTo?: ComposerReply | null;
  onCancelReply?: () => void;
}

/**
 * The composer bar.
 * @param props See ComposerProps.
 * @returns The bar.
 */
export function Composer(props: ComposerProps): React.JSX.Element {
  const { value, onChangeText, onSend, replyTo, onCancelReply } = props;
  const insets = useSafeAreaInsets();
  const isKeyboardOpen = useKeyboardVisible();
  const rule = messageRule(value);
  const error = ruleMessage(rule);

  return (
    <View style={[styles.bar, { paddingBottom: (isKeyboardOpen ? 0 : insets.bottom) + space.md }]}>
      <View style={[columnStyle, styles.inner]}>
        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
        {replyTo ? (
          <View style={styles.reply}>
            <View style={styles.replyText}>
              <Text style={styles.replyName} numberOfLines={1}>
                {replyTo.name}
              </Text>
              <Text style={styles.replyQuote} numberOfLines={1}>
                {firstLine(replyTo.text)}
              </Text>
            </View>
            <Pressable
              onPress={onCancelReply}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Cancel reply"
            >
              <X size={size.iconSmall} color={colors.muted} strokeWidth={ICON_STROKE} />
            </Pressable>
          </View>
        ) : null}
        <View style={styles.row}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Message…"
            placeholderTextColor={colors.muted}
            multiline
            accessibilityLabel="Message"
            style={styles.input}
          />
          <Pressable
            onPress={() => onSend(value.trim())}
            disabled={!rule.isValid}
            accessibilityRole="button"
            accessibilityLabel="Send"
            accessibilityState={{ disabled: !rule.isValid }}
            style={[styles.send, !rule.isValid && styles.disabled]}
          >
            <Send size={size.iconSmall} color={colors.white} strokeWidth={ICON_STROKE} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: space.md,
  },
  inner: {
    paddingHorizontal: GUTTER,
    gap: space.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.md,
  },
  input: {
    ...type.body,
    flex: 1,
    minHeight: size.composerInput,
    maxHeight: MAX_LINES_HEIGHT,
    borderRadius: size.composerInput / 2,
    backgroundColor: colors.chip,
    color: colors.ink,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
  },
  send: {
    width: size.composerInput,
    height: size.composerInput,
    borderRadius: size.composerInput / 2,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  error: {
    ...type.label,
    color: colors.accent,
  },
  reply: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    paddingLeft: space.sm,
  },
  replyText: {
    flex: 1,
  },
  replyName: {
    ...type.caption,
    fontFamily: fonts.semibold,
    color: colors.ink,
  },
  replyQuote: {
    ...type.caption,
    color: colors.muted,
  },
});
