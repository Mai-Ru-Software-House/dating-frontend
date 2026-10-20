/**
 * favorites.ts (mock)
 * Mock favorites; Tee starts with Mint and Fern.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { FavoritesApi } from "../favorites";
import { authed, favoritesOf } from "./db";

export const mockFavoritesApi: FavoritesApi = {
  /**
   * Mock of GET /favorites.
   * @returns The signed-in user's favorite people.
   * @throws ApiError UNAUTHENTICATED when no one is signed in.
   */
  async getFavorites() {
    const me = await authed();
    return [...favoritesOf(me.profile.userId)];
  },
  /**
   * Mock of PUT /favorites/{userId}.
   * @param userId The person to add.
   * @returns After the favorite is added.
   * @throws ApiError UNAUTHENTICATED when no one is signed in.
   */
  async add(userId) {
    const me = await authed();
    favoritesOf(me.profile.userId).add(userId);
  },
  /**
   * Mock of DELETE /favorites/{userId}.
   * @param userId The person to remove.
   * @returns After the favorite is removed.
   * @throws ApiError UNAUTHENTICATED when no one is signed in.
   */
  async remove(userId) {
    const me = await authed();
    favoritesOf(me.profile.userId).delete(userId);
  },
};
