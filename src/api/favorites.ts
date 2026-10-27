/**
 * favorites.ts
 * Favorites (api-integration.md 6.9). The app keeps one favorites set from GET /favorites.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { request } from "./client";
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
    await request<unknown>("DELETE", `/favorites/${encodeURIComponent(userId)}`);
  },
};

/** Favorite endpoints, real or mock. */
export const favoritesApi: FavoritesApi =
  process.env.EXPO_PUBLIC_USE_MOCKS === "1"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- loaded only in mock mode so release bundles drop src/api/mocks
      (require("./mocks/favorites") as typeof import("./mocks/favorites")).mockFavoritesApi
    : realFavoritesApi;
