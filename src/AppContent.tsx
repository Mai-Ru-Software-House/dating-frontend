/**
 * AppContent.tsx
 * What the app shows once the providers are up: nothing while fonts or the session check are
 * pending, the offline screen, or the navigation. Hides the splash screen as soon as it is known.
 * Created by Tee (Kittiphon Kijpinyochai), 20 October 2026
 */
import { DefaultTheme, NavigationContainer, type Theme } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { RootNavigator } from "./navigation/RootNavigator";
import { OfflineScreen } from "./screens/account/OfflineScreen";
import { useSession } from "./session/SessionProvider";
import { colors } from "./theme";

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.accent },
};

/**
 * Picks what to show from the session status, and hides the splash once it is known.
 * @param props.areFontsReady Whether the font has loaded.
 * @returns The navigation, the offline screen, or nothing while checking.
 */
export function AppContent({
  areFontsReady,
}: {
  areFontsReady: boolean;
}): React.JSX.Element | null {
  const { status, userId } = useSession();
  const isReady = areFontsReady && status !== "checking";

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {
        // Already hidden; nothing to do.
      });
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }
  if (status === "offline") {
    return <OfflineScreen />;
  }
  return (
    // Keyed by user: a new user gets a fresh navigation state, so back can't reach the previous
    // user's screens (LG08). The container keeps its state across navigator remounts otherwise.
    <NavigationContainer key={userId || "signed-out"} theme={navigationTheme}>
      <RootNavigator isSignedIn={status === "signedIn"} />
    </NavigationContainer>
  );
}
