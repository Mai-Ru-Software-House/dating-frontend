/**
 * useRefreshOnFocus.ts
 * Refetches when a screen gains focus again (not on the first focus, which already loads).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";

/**
 * Calls refetch whenever the screen is focused again.
 * @param refetch What to run.
 */
export function useRefreshOnFocus(refetch: () => unknown): void {
  const isFirst = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirst.current) {
        isFirst.current = false;
        return;
      }
      void refetch();
    }, [refetch]),
  );
}
