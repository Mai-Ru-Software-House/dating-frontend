/**
 * favorites.ts (mock)
 * Mock favorites; Tee starts with Mint and Fern.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { FavoritesApi } from "../favorites";
import { authed, favoritesOf } from "./db";

export const mockFavoritesApi: FavoritesApi = {
  async getFavorites() {
    const me = await authed();
    return [...favoritesOf(me.profile.userId)];
  },
  async add(userId) {
    const me = await authed();
    favoritesOf(me.profile.userId).add(userId);
  },
  async remove(userId) {
    const me = await authed();
    favoritesOf(me.profile.userId).delete(userId);
  },
};
