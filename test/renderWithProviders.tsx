/**
 * renderWithProviders.tsx
 * Renders a component or screen the way the app does (unit-test-plan.md 2.5): safe area, a fresh
 * QueryClient with retry off, toasts, a fake session and navigation. Screens sit in a real native
 * stack on top of a "Previous" route; every other route is a stub that shows its name and params,
 * so tests check navigation through the returned navigation ref.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import {
  createNavigationContainerRef,
  NavigationContainer,
  type NavigationContainerRefWithCurrent,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import type { ComponentType, ReactElement, ReactNode } from "react";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "../src/components/Toast";
import { SessionContext, type SessionApi } from "../src/session/SessionProvider";
import { USERS } from "./fixtures/seed";
import { SAFE_AREA_METRICS } from "./safeArea";

/** Every route name in the app (root stack, tabs and the Notes tab's stack). */
const ROUTE_NAMES = [
  "Previous",
  "Landing",
  "Login",
  "CreateProfile",
  "Tabs",
  "CandidateProfile",
  "Conversation",
  "Notes",
  "NoteDetail",
  "Profile",
  "EditProfile",
  "SwitchUser",
  "SwitchLogin",
  "HomeTab",
  "MatchesTab",
  "ChatsTab",
  "NotesTab",
  "NotesPeople",
  "NotesInTab",
] as const;

type ParamList = Record<string, object | undefined>;

const Stack = createNativeStackNavigator<ParamList>();

/** A fake session: signed in as alice, with every action a jest.fn. */
export function fakeSession(overrides: Partial<SessionApi> = {}): SessionApi {
  return {
    status: "signedIn",
    userId: USERS.alice.userId,
    logIn: jest.fn(async () => undefined),
    logOut: jest.fn(async () => undefined),
    switchTo: jest.fn(),
    expire: jest.fn(),
    retry: jest.fn(),
    ...overrides,
  };
}

/** A fresh query client that never retries. */
export function testQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: 0 } },
  });
}

/** Options for rendering. */
export interface RenderOptions {
  queryClient?: QueryClient;
  session?: SessionApi;
  /** The route under the screen, where goBack lands (default "Previous"). */
  below?: string;
}

/** What the render helpers return. */
export interface Rendered {
  queryClient: QueryClient;
  session: SessionApi;
  navigation: NavigationContainerRefWithCurrent<ParamList>;
}

/**
 * The app's providers around some content.
 * @param props.children The content.
 * @param props.queryClient The query client.
 * @param props.session The session.
 * @returns The wrapped content.
 */
function Providers(props: {
  children: ReactNode;
  queryClient: QueryClient;
  session: SessionApi;
}): React.JSX.Element {
  return (
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <QueryClientProvider client={props.queryClient}>
        <ToastProvider>
          <SessionContext.Provider value={props.session}>{props.children}</SessionContext.Provider>
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

/**
 * A stub screen that shows its route name and params.
 * @param props.route The route.
 * @returns The stub.
 */
function StubScreen({ route }: { route: { name: string; params?: object } }): React.JSX.Element {
  return <Text>{`Screen: ${route.name} ${JSON.stringify(route.params ?? {})}`}</Text>;
}

/**
 * Renders a component (not a screen) inside a navigation container and the providers.
 * @param ui The component.
 * @param options Query client and session.
 * @returns The query client, session and navigation ref.
 */
export async function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions = {},
): Promise<Rendered> {
  return renderScreen(() => ui, "Test", undefined, options);
}

/**
 * Renders a screen on a native stack, on top of a "Previous" route.
 * @param screen The screen component.
 * @param name Its route name.
 * @param params Its route params.
 * @param options Query client and session.
 * @returns The query client, session and navigation ref.
 */
export async function renderScreen<P extends object>(
  screen: ComponentType<P>,
  name: string,
  params?: object,
  options: RenderOptions = {},
): Promise<Rendered> {
  const queryClient = options.queryClient ?? testQueryClient();
  const session = options.session ?? fakeSession();
  const navigation = createNavigationContainerRef<ParamList>();
  const below = options.below ?? "Previous";
  const others = ROUTE_NAMES.filter((n) => n !== name);
  await render(
    <Providers queryClient={queryClient} session={session}>
      <NavigationContainer
        ref={navigation}
        initialState={{
          index: 1,
          routes: [{ name: below }, { name, params }],
        }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
          {others.map((n) => (
            <Stack.Screen key={n} name={n} component={StubScreen} />
          ))}
          <Stack.Screen name={name} component={screen as ComponentType<object>} />
        </Stack.Navigator>
      </NavigationContainer>
    </Providers>,
  );
  return { queryClient, session, navigation };
}

/**
 * The route the navigation ref is on.
 * @param navigation The ref from a render helper.
 * @returns Its name and params.
 */
export function currentRoute(navigation: Rendered["navigation"]): {
  name?: string;
  params?: object;
} {
  const route = navigation.getCurrentRoute();
  return { name: route?.name, params: route?.params };
}

/**
 * A wrapper with the app's providers, for renderHook.
 * @param options Query client and session.
 * @returns The wrapper and the query client and session inside it.
 */
export function createWrapper(options: RenderOptions = {}): {
  wrapper: ComponentType<{ children: ReactNode }>;
  queryClient: QueryClient;
  session: SessionApi;
} {
  const queryClient = options.queryClient ?? testQueryClient();
  const session = options.session ?? fakeSession();
  /** The providers around the hook. */
  function Wrapper({ children }: { children: ReactNode }): React.JSX.Element {
    return (
      <Providers queryClient={queryClient} session={session}>
        {children}
      </Providers>
    );
  }
  return { wrapper: Wrapper, queryClient, session };
}
