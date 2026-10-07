/**
 * RootNavigator.tsx
 * Shows the Auth screens or the Main screens from the session status. Switching is a conditional
 * render, not a navigate() call, so back can never return to Login after logging in (design.md 4).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CreateProfileScreen } from "../screens/account/CreateProfileScreen";
import { EditProfileScreen } from "../screens/account/EditProfileScreen";
import { LandingScreen } from "../screens/account/LandingScreen";
import { LoginScreen } from "../screens/account/LoginScreen";
import { ProfileScreen } from "../screens/account/ProfileScreen";
import { SwitchUserScreen } from "../screens/account/SwitchUserScreen";
import { ConversationScreen } from "../screens/chat/ConversationScreen";
import { NoteDetailScreen } from "../screens/chat/NoteDetailScreen";
import { NotesScreen } from "../screens/chat/NotesScreen";
import { CandidateProfileScreen } from "../screens/match/CandidateProfileScreen";
import { MainTabs } from "./MainTabs";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Props for RootNavigator. */
export interface RootNavigatorProps {
  /** True when there is a valid session. */
  isSignedIn: boolean;
}

/**
 * The root stack navigator.
 * @param props.isSignedIn Whether to show the Main screens.
 * @returns The navigator.
 */
export function RootNavigator({ isSignedIn }: RootNavigatorProps): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <Stack.Group>
          <Stack.Screen name="Tabs" component={MainTabs} />
          <Stack.Screen name="CandidateProfile" component={CandidateProfileScreen} />
          <Stack.Screen name="Conversation" component={ConversationScreen} />
          <Stack.Screen name="Notes" component={NotesScreen} />
          <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="SwitchUser" component={SwitchUserScreen} />
          <Stack.Screen name="SwitchLogin" component={LoginScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
