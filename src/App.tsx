/**
 * App.tsx
 * Root component of the Mai Ru app: loads the Inter font, holds the splash screen until the font
 * and the session check are ready, and hosts the providers and navigation.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { useFonts } from "@expo-google-fonts/inter/useFonts";
import { DefaultTheme, NavigationContainer, type Theme } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "./components/Toast";
import { RootNavigator } from "./navigation/RootNavigator";
import { OfflineScreen } from "./screens/account/OfflineScreen";
import { queryClient } from "./session/queryClient";
import { SessionProvider, useSession } from "./session/SessionProvider";
import { colors } from "./theme";

SplashScreen.preventAutoHideAsync().catch(() => {
  // The splash screen may already be hidden (fast refresh); nothing to do.
});

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.accent },
};

/**
 * Picks what to show from the session status, and hides the splash once it is known.
 * @param props.areFontsReady Whether the font has loaded.
 * @returns The navigation, the offline screen, or nothing while checking.
 */
function AppContent({ areFontsReady }: { areFontsReady: boolean }): React.JSX.Element | null {
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

/**
 * The app's root component.
 * @returns The whole app tree.
 */
export default function App(): React.JSX.Element {
  const [areFontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <SessionProvider>
              <AppContent areFontsReady={areFontsLoaded || fontError !== null} />
            </SessionProvider>
          </ToastProvider>
        </QueryClientProvider>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
