/**
 * appFocus.ts
 * Tells TanStack Query when the app is in the foreground. React Native has no window focus, so
 * without this the chat polls (and marks messages read) while the app is in the background; iOS
 * keeps running JavaScript for a short time after the app is backgrounded.
 * Created by Tee (Kittiphon Kijpinyochai), 26 October 2026
 */
import { focusManager } from "@tanstack/react-query";
import { AppState, Platform, type AppStateStatus } from "react-native";

/**
 * Starts following the app's foreground state.
 * @returns A function that stops following it.
 */
export function watchAppFocus(): () => void {
  if (Platform.OS === "web") {
    return () => undefined;
  }
  const subscription = AppState.addEventListener("change", (status: AppStateStatus) => {
    focusManager.setFocused(status === "active");
  });
  return () => {
    subscription.remove();
    focusManager.setFocused(undefined);
  };
}
