/**
 * sessions.ts
 * Login and logout (api-integration.md 3.3). Accepts the A9 shape ({ accessToken, refreshToken })
 * and the 4 October contract's single { token }.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { USE_MOCKS } from "../constants/env";
import { request } from "./client";
import { mockSessionsApi } from "./mocks/sessions";
import type { OwnProfile, Session } from "./types";

/** What the server may send back from login or sign-up. */
export interface RawSession {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  userId?: string;
  profile?: OwnProfile;
}

/** Session endpoints. */
export interface SessionsApi {
  /**
   * POST /sessions.
   * @throws ApiError INVALID_CREDENTIALS, INVALID_INPUT, NETWORK_ERROR.
   */
  logIn: (username: string, password: string) => Promise<Session>;
  /**
   * Logout endpoint (DELETE /sessions/current, refresh token in the body, 8.12).
   * @throws ApiError on failure; callers ignore it.
   */
  logOut: (accessToken: string, refreshToken: string) => Promise<void>;
}

/**
 * Normalizes a login or sign-up response.
 * @param raw The response body.
 * @returns The session; refreshToken is "" for the old single-token shape.
 */
export function toSession(raw: RawSession): Session {
  return {
    accessToken: raw.accessToken ?? raw.token ?? "",
    refreshToken: raw.refreshToken ?? "",
    userId: raw.userId ?? raw.profile?.userId ?? "",
    profile: raw.profile,
  };
}

const realSessionsApi: SessionsApi = {
  async logIn(username, password) {
    const raw = await request<RawSession>("POST", "/sessions", {
      body: { username, password },
      isAuthenticated: false,
    });
    return toSession(raw);
  },
  async logOut(accessToken, refreshToken) {
    await request<void>("DELETE", "/sessions/current", {
      isAuthenticated: false,
      headers: { Authorization: `Bearer ${accessToken}` },
      body: refreshToken === "" ? undefined : { refreshToken },
    });
  },
};

/** Session endpoints, real or mock. */
export const sessionsApi: SessionsApi = USE_MOCKS ? mockSessionsApi : realSessionsApi;
