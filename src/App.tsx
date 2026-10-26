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
import { QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "./components/Toast";
import { AppContent } from "./AppContent";
import { queryClient } from "./session/queryClient";
import { SessionProvider } from "./session/SessionProvider";
import { colors } from "./theme";

SplashScreen.preventAutoHideAsync().catch(() => {
  // The splash screen may already be hidden (fast refresh); nothing to do.
});

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
