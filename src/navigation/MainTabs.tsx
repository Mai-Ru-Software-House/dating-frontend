/**
 * MainTabs.tsx
 * The four main tabs: Home, Matches, Chats and Notes.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { createBottomTabNavigator, type BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { TabBar } from "../components/TabBar";
import { useUnread } from "../hooks/useUnread";
import { ChatListScreen } from "../screens/chat/ChatListScreen";
import { HomeScreen } from "../screens/home/HomeScreen";
import { MatchesScreen } from "../screens/match/MatchesScreen";
import { NotesStack } from "./NotesStack";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Draws the custom tab bar. Declared once here so the navigator gets the same function on every render.
 * @param props The tab bar props from React Navigation.
 * @returns The tab bar.
 */
function renderTabBar(props: BottomTabBarProps): React.JSX.Element {
  return <TabBar {...props} />;
}

/**
 * The bottom tab navigator.
 * @returns The navigator.
 */
export function MainTabs(): React.JSX.Element {
  const { senderCount } = useUnread();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="MatchesTab" component={MatchesScreen} options={{ title: "Matches" }} />
      <Tab.Screen
        name="ChatsTab"
        component={ChatListScreen}
        options={{ title: "Chats", tabBarBadge: senderCount > 0 ? senderCount : undefined }}
      />
      <Tab.Screen name="NotesTab" component={NotesStack} options={{ title: "Notes" }} />
    </Tab.Navigator>
  );
}
