/**
 * useRefreshOnFocus.ts
 * Refetches when a screen gains focus again (not on the first focus, which already loads).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";

/**
 * Calls refetch whenever the screen is focused again.
 * @param refetch What to run. It may change on every render.
 */
export function useRefreshOnFocus(refetch: () => unknown): void {
  const isFirst = useRef(true);
  // useFocusEffect runs again whenever its callback changes while the screen is focused. Keeping
  // the latest refetch in a ref keeps the callback stable, so it runs on focus only (a new refetch
  // on every render would refetch on every render, and each fetch causes a render).
  const latest = useRef(refetch);
  useEffect(() => {
    latest.current = refetch;
  }, [refetch]);
  useFocusEffect(
    useCallback(() => {
      if (isFirst.current) {
        isFirst.current = false;
        return;
      }
      void latest.current();
    }, []),
  );
}
