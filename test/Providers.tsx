/**
 * Providers.tsx
 * The app's providers for tests: safe area, query client, toasts and a fake session.
 * Created by Tee (Kittiphon Kijpinyochai), 20 October 2026
 */
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "../src/components/Toast";
import { SessionContext, type SessionApi } from "../src/session/SessionProvider";
import { SAFE_AREA_METRICS } from "./safeArea";

/**
 * The providers the app mounts, with a test query client and session.
 * @param props.children What to wrap.
 * @param props.queryClient The query client.
 * @param props.session The session value.
 * @returns The wrapped children.
 */
export function Providers(props: {
  children: ReactNode;
  queryClient: QueryClient;
  session: SessionApi;
}): React.JSX.Element {
  return (
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <QueryClientProvider client={props.queryClient}>
        <ToastProvider>
          <SessionContext.Provider value={props.session}>{props.children}</SessionContext.Provider>
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
