/**
 * SessionProvider.tsx
 * Holds the session: status, tokens (in memory and in secure storage), and logIn, logOut,
 * switchTo, expire and retry (api-integration.md 3, implementation-plan.md 5.3).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useQueryClient } from "@tanstack/react-query";
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

import { setSessionBridge, type Tokens } from "../api/client";
import { toApiError } from "../api/errors";
import { SEED_KNOWN_ACCOUNTS } from "../api/mocks/fixtures";
import { profileApi } from "../api/profile";
import { sessionsApi } from "../api/sessions";
import type { OwnProfile, Session } from "../api/types";
import { useToast } from "../components/Toast";
import { USE_MOCKS } from "../constants/env";
import { hasStoredAccounts, rememberAccount, saveAccounts } from "./knownAccounts";
import { keys } from "./queryClient";
import { clearTokens, readTokens, writeTokens } from "./tokenStore";

/** Where the session stands. */
export type SessionStatus = "checking" | "signedOut" | "signedIn" | "offline";

/** What useSession returns. */
export interface SessionApi {
  status: SessionStatus;
  /** The logged-in user's ID ("" when signed out). Changes on switch, which resets navigation. */
  userId: string;
  /** Saves a session from login or sign-up and loads the profile. @throws ApiError. */
  logIn: (session: Session) => Promise<void>;
  /** Logs out: revokes the session (errors ignored), deletes tokens, clears the cache. */
  logOut: () => Promise<void>;
  /** Logs in to another account; the old session stays until this works. @throws ApiError. */
  switchTo: (username: string, password: string) => Promise<OwnProfile>;
  /** Ends the session after a failed refresh. Runs once even if called many times. */
  expire: () => void;
  /** Runs the start-up check again (from the offline screen). */
  retry: () => void;
}

/** The session context. Exported so tests can provide a fake session. */
export const SessionContext = createContext<SessionApi | null>(null);

/**
 * Provides the session to the app.
 * @param props.children The app.
 * @returns The provider.
 */
export function SessionProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [status, setStatus] = useState<SessionStatus>("checking");
  const [userId, setUserId] = useState("");
  const tokens = useRef<Tokens | null>(null);
  const hasExpired = useRef(false);
  const isChecking = useRef(true);

  const saveTokens = useCallback(async (next: Tokens) => {
    tokens.current = next;
    await writeTokens(next);
  }, []);

  const signOutLocally = useCallback(async () => {
    tokens.current = null;
    queryClient.clear();
    setUserId("");
    setStatus("signedOut");
    try {
      await clearTokens();
    } catch {
      // Secure storage failed; the tokens are gone from memory, which ends the session here.
    }
  }, [queryClient]);

  const expire = useCallback(() => {
    if (hasExpired.current || tokens.current === null) {
      return;
    }
    hasExpired.current = true;
    const wasChecking = isChecking.current;
    void signOutLocally();
    if (!wasChecking) {
      toast.show("You've been logged out. Log in again.");
    }
  }, [signOutLocally, toast]);

  const enter = useCallback(
    async (profile: OwnProfile) => {
      queryClient.setQueryData(keys.me, profile);
      hasExpired.current = false;
      setUserId(profile.userId);
      setStatus("signedIn");
      try {
        await rememberAccount(profile);
      } catch {
        // Remembering the account is a convenience; the login still worked.
      }
    },
    [queryClient],
  );

  const check = useCallback(async () => {
    isChecking.current = true;
    try {
      if (USE_MOCKS && !(await hasStoredAccounts())) {
        await saveAccounts(SEED_KNOWN_ACCOUNTS);
      }
      tokens.current = await readTokens();
      if (tokens.current === null) {
        setStatus("signedOut");
        return;
      }
      await enter(await profileApi.getMe());
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.code === "UNAUTHENTICATED") {
        await signOutLocally();
      } else {
        setStatus("offline");
      }
    } finally {
      isChecking.current = false;
    }
  }, [enter, signOutLocally]);

  useEffect(() => {
    setSessionBridge({ getTokens: () => tokens.current, saveTokens, expire });
    // Started from a callback: check() only sets state after its first await.
    queueMicrotask(() => {
      void check();
    });
    return () => setSessionBridge(null);
  }, [check, expire, saveTokens]);

  const logIn = useCallback(
    async (session: Session) => {
      await saveTokens({ accessToken: session.accessToken, refreshToken: session.refreshToken });
      queryClient.clear();
      await enter(session.profile ?? (await profileApi.getMe()));
    },
    [enter, queryClient, saveTokens],
  );

  const logOut = useCallback(async () => {
    const current = tokens.current;
    if (current !== null) {
      try {
        await sessionsApi.logOut(current.accessToken, current.refreshToken);
      } catch {
        // A 401 or network error still logs out on this phone (api-integration.md 3.3).
      }
    }
    await signOutLocally();
  }, [signOutLocally]);

  const switchTo = useCallback(
    async (username: string, password: string) => {
      const next = await sessionsApi.logIn(username, password);
      const old = tokens.current;
      if (old !== null) {
        try {
          await sessionsApi.logOut(old.accessToken, old.refreshToken);
        } catch {
          // The old session is abandoned either way.
        }
      }
      await saveTokens({ accessToken: next.accessToken, refreshToken: next.refreshToken });
      queryClient.clear();
      const profile = next.profile ?? (await profileApi.getMe());
      await enter(profile);
      return profile;
    },
    [enter, queryClient, saveTokens],
  );

  const retry = useCallback(() => {
    setStatus("checking");
    void check();
  }, [check]);

  const api = useMemo(
    () => ({ status, userId, logIn, logOut, switchTo, expire, retry }),
    [status, userId, logIn, logOut, switchTo, expire, retry],
  );
  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>;
}

/**
 * The session.
 * @returns The session API.
 * @throws Error when used outside SessionProvider.
 */
export function useSession(): SessionApi {
  const session = useContext(SessionContext);
  if (session === null) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return session;
}
