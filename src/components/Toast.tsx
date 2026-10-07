/**
 * Toast.tsx
 * Short messages at the bottom of the screen ("Note deleted.", "Profile updated."), shown with
 * useToast().show(). They fade out by themselves and are announced to screen readers.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, MAX_CONTENT_WIDTH, size, space } from "../theme";

const VISIBLE_MS = 2500;
const FADE_MS = 200;

/** What useToast returns. */
export interface ToastApi {
  /** Shows a message for a few seconds. */
  show: (message: string) => void;
}

const ToastContext = createContext<ToastApi>({ show: () => undefined });

/**
 * Gives the app a toast. Wrap the app once.
 * @param props.children The app.
 * @returns The provider with the toast drawn above the app.
 */
export function ToastProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (next: string) => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
      setMessage(next);
      AccessibilityInfo.announceForAccessibility(next);
      Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(
          () => setMessage(null),
        );
      }, VISIBLE_MS);
    },
    [opacity],
  );
  const api = useMemo(() => ({ show }), [show]);

  useEffect(
    () => () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {message !== null ? (
        <View
          pointerEvents="none"
          style={[styles.layer, { bottom: insets.bottom + size.tabBar + space.xxl }]}
        >
          <Animated.View style={[styles.toast, { opacity }]}>
            <Text style={styles.text}>{message}</Text>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

/**
 * The app's toast.
 * @returns { show }.
 */
export function useToast(): ToastApi {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    left: space.xl,
    right: space.xl,
    alignItems: "center",
  },
  toast: {
    maxWidth: MAX_CONTENT_WIDTH,
    backgroundColor: colors.ink,
    borderRadius: 22,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.white,
    textAlign: "center",
  },
});
