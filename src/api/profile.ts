/**
 * profile.ts
 * Profile endpoints: own profile, other users, username check, sign-up and edit
 * (api-integration.md 6.1, 6.4, 6.5, 6.14).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { USE_MOCKS } from "../constants/env";
import { request } from "./client";
import { mockProfileApi } from "./mocks/profile";
import { toSession, type RawSession } from "./sessions";
import type {
  CreateProfileBody,
  OwnProfile,
  PublicProfile,
  Session,
  UpdateProfileBody,
} from "./types";

/** Profile endpoints. */
export interface ProfileApi {
  /** GET /users/me. @throws ApiError UNAUTHENTICATED, NETWORK_ERROR. */
  getMe: () => Promise<OwnProfile>;
  /** GET /users/{userId}. @throws ApiError USER_NOT_FOUND. */
  getUser: (userId: string) => Promise<PublicProfile>;
  /** GET /usernames/{username}. @throws ApiError INVALID_INPUT for a bad format. */
  checkUsername: (username: string) => Promise<boolean>;
  /** POST /users. @throws ApiError USERNAME_TAKEN, INVALID_INPUT (with field). */
  createProfile: (body: CreateProfileBody) => Promise<Session>;
  /** PATCH /users/me with only the changed fields. @throws ApiError INVALID_INPUT. */
  updateMe: (body: UpdateProfileBody) => Promise<OwnProfile>;
}

const realProfileApi: ProfileApi = {
  getMe: () => request<OwnProfile>("GET", "/users/me"),
  getUser: (userId) => request<PublicProfile>("GET", `/users/${encodeURIComponent(userId)}`),
  async checkUsername(username) {
    const result = await request<{ isAvailable: boolean }>(
      "GET",
      `/usernames/${encodeURIComponent(username)}`,
      { isAuthenticated: false },
    );
    return result.isAvailable;
  },
  async createProfile(body) {
    const raw = await request<RawSession>("POST", "/users", { body, isAuthenticated: false });
    return toSession(raw);
  },
  updateMe: (body) => request<OwnProfile>("PATCH", "/users/me", { body }),
};

/** Profile endpoints, real or mock. */
export const profileApi: ProfileApi = USE_MOCKS ? mockProfileApi : realProfileApi;
