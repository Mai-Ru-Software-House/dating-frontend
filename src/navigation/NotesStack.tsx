/**
 * NotesStack.tsx
 * The Notes tab's own stack: people with notes (12), then one person's notes (13, 14).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { NotesPeopleScreen } from "../screens/chat/NotesPeopleScreen";
import { NotesScreen } from "../screens/chat/NotesScreen";
import type { NotesStackParamList } from "./types";

const Stack = createNativeStackNavigator<NotesStackParamList>();

/**
 * The Notes tab's stack navigator.
 * @returns The navigator.
 */
export function NotesStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotesPeople" component={NotesPeopleScreen} />
      <Stack.Screen name="NotesInTab" component={NotesScreen} />
    </Stack.Navigator>
  );
}
