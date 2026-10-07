/**
 * places.ts (mock)
 * Mock place lookup: 12.500, 100.900 has no place name (A8); everywhere else is Lat Krabang.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { ApiError } from "../errors";
import type { PlacesApi } from "../places";
import { mockDelay } from "./db";

export const mockPlacesApi: PlacesApi = {
  async lookup(lat, lon) {
    await mockDelay();
    if (lat.toFixed(3) === "12.500" && lon.toFixed(3) === "100.900") {
      throw new ApiError(404, "PLACE_NOT_FOUND", "No place at that point");
    }
    return "Bangkok, Lat Krabang";
  },
};
