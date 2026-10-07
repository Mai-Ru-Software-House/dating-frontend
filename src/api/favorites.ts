/**
 * favorites.ts
 * Favorites (api-integration.md 6.9). The app keeps one favorites set from GET /favorites.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { USE_MOCKS } from "../constants/env";
import { request } from "./client";
import { mockFavoritesApi } from "./mocks/favorites";
import type { UserSummary } from "./types";

/** Favorite endpoints. */
export interface FavoritesApi {
  /** GET /favorites: the favorite users' IDs. */
  getFavorites: () => Promise<string[]>;
  /** PUT /favorites/{userId}; safe to repeat. @throws ApiError USER_NOT_FOUND. */
  add: (userId: string) => Promise<void>;
  /** DELETE /favorites/{userId}; 204 even when not a favorite. */
  remove: (userId: string) => Promise<void>;
}

const realFavoritesApi: FavoritesApi = {
  async getFavorites() {
    const result = await request<{ favorites: { user: UserSummary }[] }>("GET", "/favorites");
    return result.favorites.map((f) => f.user.userId);
  },
  async add(userId) {
    await request<unknown>("PUT", `/favorites/${encodeURIComponent(userId)}`);
  },
  async remove(userId) {
    await request<void>("DELETE", `/favorites/${encodeURIComponent(userId)}`);
  },
};

/** Favorite endpoints, real or mock. */
export const favoritesApi: FavoritesApi = USE_MOCKS ? mockFavoritesApi : realFavoritesApi;
