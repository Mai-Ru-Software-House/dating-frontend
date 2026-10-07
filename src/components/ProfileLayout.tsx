/**
 * ProfileLayout.tsx
 * Shared layout of the candidate profile (09) and the own profile (19): a full-bleed photo that
 * scales with the window, a white back button over it, and a bg sheet with 28 pt top corners that
 * overlaps the photo's bottom. The whole page scrolls (design.md 2.6, 6.10, 6.16).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePullRefresh } from "../hooks/usePullRefresh";
import {
  colors,
  columnStyle,
  GUTTER,
  heroHeight,
  radius,
  SHEET_OVERLAP,
  size,
  space,
} from "../theme";
import { BackButton } from "./BackButton";
import { PhotoFill } from "./PhotoFill";

/** Props for ProfileLayout. */
export interface ProfileLayoutProps {
  userId: string;
  photoUrl: string;
  /** Photo height as a share of the window height, capped at width × maxRatio. */
  photoSize: { share: number; maxRatio: number };
  onBack: () => void;
  /** The sheet's content. */
  children: ReactNode;
  /** Fixed bar under the page (ActionBar). */
  footer?: ReactNode;
  /** Pull to refresh handler; may return a promise. */
  onRefresh?: () => unknown;
}

/**
 * The profile page layout.
 * @param props See ProfileLayoutProps.
 * @returns The page.
 */
export function ProfileLayout(props: ProfileLayoutProps): React.JSX.Element {
  const { userId, photoUrl, photoSize, onBack, children, footer, onRefresh } = props;
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pull = usePullRefresh(onRefresh ?? noop);
  const photoHeight = heroHeight(window, photoSize.share, photoSize.maxRatio);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: (footer ? 0 : insets.bottom) + space.xxl }}
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
        <View style={{ height: photoHeight + SHEET_OVERLAP }}>
          <PhotoFill userId={userId} photoUrl={photoUrl} />
          <View
            style={[styles.topBand, { height: insets.top + space.sm + size.backButton + space.lg }]}
          />
        </View>
        <View style={styles.sheet}>
          <View style={[columnStyle, styles.column]}>{children}</View>
        </View>
      </ScrollView>
      <View
        style={[styles.back, { top: insets.top + space.sm, left: Math.max(GUTTER, insets.left) }]}
      >
        <BackButton onPress={onBack} isOnPhoto />
      </View>
      {footer}
    </View>
  );
}

const noop = (): void => undefined;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  sheet: {
    marginTop: -SHEET_OVERLAP,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: space.xxl,
  },
  column: {
    paddingHorizontal: GUTTER,
  },
  back: {
    position: "absolute",
  },
  topBand: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.scrim,
  },
});
