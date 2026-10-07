/**
 * MainTabs.tsx
 * The four main tabs: Home, Matches, Chats and Notes.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { TabBar } from "../components/TabBar";
import { useUnread } from "../hooks/useUnread";
import { ChatListScreen } from "../screens/chat/ChatListScreen";
import { HomeScreen } from "../screens/home/HomeScreen";
import { MatchesScreen } from "../screens/match/MatchesScreen";
import { NotesStack } from "./NotesStack";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * The bottom tab navigator.
 * @returns The navigator.
 */
export function MainTabs(): React.JSX.Element {
  const { senderCount } = useUnread();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
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
