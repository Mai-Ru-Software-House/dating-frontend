/**
 * useKeyboardVisible.ts
 * Whether the on-screen keyboard is open, so bottom bars can drop the bottom safe-area inset while
 * they sit on top of the keyboard.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

/**
 * Tracks the keyboard. On iOS the keyboard animates and KeyboardAvoidingView moves the bar when it
 * starts, so the "will" events keep the inset change in step with it; the "did" events would fire
 * about 250 ms later and make the bar jump. Android only sends the "did" events.
 * @returns True while the keyboard is shown.
 */
export function useKeyboardVisible(): boolean {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const isIos = Platform.OS === "ios";
    const show = Keyboard.addListener(isIos ? "keyboardWillShow" : "keyboardDidShow", () => {
      setIsVisible(true);
    });
    const hide = Keyboard.addListener(isIos ? "keyboardWillHide" : "keyboardDidHide", () => {
      setIsVisible(false);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return isVisible;
}
