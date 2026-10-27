/**
 * places.ts
 * Place lookup from GPS coordinates (api-integration.md 6.3). No session needed.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { request } from "./client";

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
export const placesApi: PlacesApi =
  process.env.EXPO_PUBLIC_USE_MOCKS === "1"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- loaded only in mock mode so release bundles drop src/api/mocks
      (require("./mocks/places") as typeof import("./mocks/places")).mockPlacesApi
    : realPlacesApi;
