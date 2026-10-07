/**
 * types.ts
 * Route names and parameters for every navigator (design.md 4).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

/** The person a Notes or Conversation screen is about. */
export interface PersonParams {
  userId: string;
  displayName: string;
  photoUrl: string;
}

/** Stack inside the Notes tab: the people list, then one person's notes. */
export type NotesStackParamList = {
  NotesPeople: undefined;
  NotesInTab: PersonParams;
};

/** The four tabs. */
export type TabParamList = {
  HomeTab: undefined;
  MatchesTab: { segment?: "recommended" | "search" } | undefined;
  ChatsTab: undefined;
  NotesTab: NavigatorScreenParams<NotesStackParamList> | undefined;
};

/** Root stack: Auth screens when signed out, Main screens when signed in. */
export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  CreateProfile: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  CandidateProfile: { userId: string };
  Conversation: PersonParams;
  Notes: PersonParams;
  NoteDetail: { noteId: string; aboutUserId: string; displayName: string; photoUrl: string };
  Profile: undefined;
  EditProfile: undefined;
  SwitchUser: undefined;
  SwitchLogin: { username?: string } | undefined;
};

/** Props of a screen on the root stack. */
export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

/** Props of a tab's root screen. */
export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

/** Props of a screen inside the Notes tab's stack. */
export type NotesStackScreenProps<T extends keyof NotesStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<NotesStackParamList, T>,
  TabScreenProps<"NotesTab">
>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
