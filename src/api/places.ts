/**
 * places.ts
 * Place lookup from GPS coordinates (api-integration.md 6.3). No session needed.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { USE_MOCKS } from "../constants/env";
import { request } from "./client";
import { mockPlacesApi } from "./mocks/places";

/** Place endpoints. */
export interface PlacesApi {
  /**
   * GET /places.
   * @throws ApiError PLACE_NOT_FOUND, GEOCODER_UNAVAILABLE, NETWORK_ERROR.
   */
  lookup: (lat: number, lon: number) => Promise<string>;
}

const realPlacesApi: PlacesApi = {
  async lookup(lat, lon) {
    const result = await request<{ placeName: string }>("GET", "/places", {
      query: { lat, lon },
      isAuthenticated: false,
    });
    return result.placeName;
  },
};

/** Place endpoints, real or mock. */
export const placesApi: PlacesApi = USE_MOCKS ? mockPlacesApi : realPlacesApi;
