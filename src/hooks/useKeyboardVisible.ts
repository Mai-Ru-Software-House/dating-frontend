/**
 * useKeyboardVisible.ts
 * Whether the on-screen keyboard is open, so bottom bars can drop the bottom safe-area inset while
 * they sit on top of the keyboard.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

/**
 * Tracks the keyboard.
 * @returns True while the keyboard is shown.
 */
export function useKeyboardVisible(): boolean {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setIsVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setIsVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return isVisible;
}
