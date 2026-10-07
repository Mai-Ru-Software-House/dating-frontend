/**
 * Screen.tsx
 * Wraps every screen: background, safe-area insets, keyboard avoidance, scrolling and the centered
 * content column of at most 600 pt (design.md 2.6). Screens never handle insets or width themselves.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { ReactNode, Ref } from "react";
import {
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePullRefresh } from "../hooks/usePullRefresh";
import { colors, columnStyle, GUTTER, space } from "../theme";

const noop = (): void => undefined;

/** Props for Screen. */
export interface ScreenProps {
  /** The screen's content. */
  children: ReactNode;
  /** A fixed bar above the content (TopBar). Spans the full width. */
  header?: ReactNode;
  /** A fixed bar below the content (ActionBar, Composer). It adds the bottom inset itself. */
  footer?: ReactNode;
  /** Wrap the content in a ScrollView (default). Pass false when the child is a FlatList. */
  isScrollable?: boolean;
  /** Pad the content column with the 20 pt gutters (default true). */
  isPadded?: boolean;
  /** Add the top safe-area inset (default true). False for full-bleed photos. */
  hasTopInset?: boolean;
  /** The screen sits inside the tab navigator, so the tab bar handles the bottom inset. */
  isInTabs?: boolean;
  /** Pull to refresh handler; may return a promise. Shows the refresh control when set. */
  onRefresh?: () => unknown;
  /** Extra style for the content column. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Background color (default bg). */
  backgroundColor?: string;
  /** Ref to the ScrollView, to scroll a field into view. */
  scrollRef?: Ref<ScrollView>;
}

/**
 * Screen wrapper used by every screen.
 * @param props See ScreenProps.
 * @returns The wrapped screen.
 */
export function Screen(props: ScreenProps): React.JSX.Element {
  const {
    children,
    header,
    footer,
    isScrollable = true,
    isPadded = true,
    hasTopInset = true,
    isInTabs = false,
    onRefresh,
    contentStyle,
    backgroundColor = colors.bg,
    scrollRef,
  } = props;
  const insets = useSafeAreaInsets();
  const pull = usePullRefresh(onRefresh ?? noop);
  const needsBottomInset = footer === undefined && !isInTabs;
  const column = [columnStyle, isPadded && styles.padded, contentStyle];

  return (
    <View style={[styles.root, { backgroundColor, paddingTop: hasTopInset ? insets.top : 0 }]}>
      {header}
      {/* Android draws edge to edge, so the window doesn't resize for the keyboard: pad on both. */}
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {isScrollable ? (
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: (needsBottomInset ? insets.bottom : 0) + space.xxl },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={pull.isPulling}
                  onRefresh={pull.onPull}
                  tintColor={colors.accent}
                  colors={[colors.accent]}
                />
              ) : undefined
            }
          >
            <View style={column}>{children}</View>
          </ScrollView>
        ) : (
          <View style={[styles.flex, { paddingBottom: needsBottomInset ? insets.bottom : 0 }]}>
            {children}
          </View>
        )}
        {footer}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: GUTTER,
  },
});
