/**
 * TabBar.tsx
 * Custom bottom tab bar (design.md 3.12): Home, Matches, Chats and Notes, with an unread badge on
 * Chats taken from the tab's tabBarBadge option.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { FileText, Heart, House, MessageSquare, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, columnStyle, fonts, ICON_STROKE, MAX_FONT_SCALE, size, type } from "../theme";
import { UnreadBadge } from "./UnreadBadge";

const ICONS: Record<string, LucideIcon> = {
  HomeTab: House,
  MatchesTab: Heart,
  ChatsTab: MessageSquare,
  NotesTab: FileText,
};

/**
 * The bottom tab bar.
 * @param props React Navigation's tab bar props.
 * @returns The bar.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      <View style={[columnStyle, styles.row]} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isActive = state.index === index;
          const label = options.title ?? route.name;
          const Icon = ICONS[route.name] ?? House;
          const badge = typeof options.tabBarBadge === "number" ? options.tabBarBadge : 0;
          const color = isActive ? colors.accent : colors.muted;
          const onPress = (): void => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={badge > 0 ? `${label}, ${badge} unread` : label}
            >
              <View>
                <Icon size={size.icon} color={color} strokeWidth={ICON_STROKE} />
                <View style={styles.badge}>
                  <UnreadBadge count={badge} size={16} />
                </View>
              </View>
              <Text
                style={[
                  styles.label,
                  { color, fontFamily: isActive ? fonts.semibold : fonts.medium },
                ]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  row: {
    flexDirection: "row",
    minHeight: size.tabBar + 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 6,
  },
  badge: {
    position: "absolute",
    top: -6,
    left: 14,
  },
  label: {
    ...type.meta,
  },
});
