/**
 * usePullRefresh.ts
 * Pull-to-refresh state that only shows the spinner for a pull the user made, not for background
 * refetches (focus, invalidation), which made the Android spinner flash.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useCallback, useState } from "react";

/**
 * Wraps a refresh action.
 * @param refresh What to run on pull; may return a promise.
 * @returns Whether the pull is running, and the handler for RefreshControl.
 */
export function usePullRefresh(refresh: () => unknown): { isPulling: boolean; onPull: () => void } {
  const [isPulling, setIsPulling] = useState(false);
  const onPull = useCallback(() => {
    setIsPulling(true);
    const run = async (): Promise<void> => {
      try {
        await refresh();
      } catch {
        // The screen shows its own error state.
      } finally {
        setIsPulling(false);
      }
    };
    void run();
  }, [refresh]);
  return { isPulling, onPull };
}
