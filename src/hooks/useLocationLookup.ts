/**
 * useLocationLookup.ts
 * "Use GPS" (api-integration.md 6.3): asks for permission, reads the position with balanced
 * accuracy, then looks up the place name. No place name is fine (A8): the coordinates are kept.
 * A geocoder failure gets one automatic retry after 2 s, then a manual "Try again".
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import * as Location from "expo-location";
import { useCallback, useState } from "react";

import { toApiError } from "../api/errors";
import { placesApi } from "../api/places";
import type { Coordinates } from "../api/types";
import { PLACE_RETRY_DELAY_MS } from "../constants/limits";

/** Where the lookup stands. */
export type LocationPhase = "idle" | "locating" | "found" | "noName" | "denied";

/** A finished lookup. */
export interface LocationFix {
  coords: Coordinates;
  placeName: string | null;
}

/** What the hook returns. */
export interface LocationLookup {
  phase: LocationPhase;
  /** True after GEOCODER_UNAVAILABLE: show "Try again". */
  canRetry: boolean;
  /** Starts a new GPS fix. */
  locate: () => Promise<void>;
  /** Looks up the name again for the last coordinates. */
  retry: () => Promise<void>;
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Reads the position with balanced accuracy. Balanced uses Android's network provider, which can
 * be switched off; then the last known position, then GPS, are tried.
 * @returns The position, or null when none can be read.
 */
async function readPosition(): Promise<Location.LocationObject | null> {
  try {
    return await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  } catch {
    // Network location unavailable: try the other sources below.
  }
  try {
    const last = await Location.getLastKnownPositionAsync();
    if (last !== null) {
      return last;
    }
    return await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  } catch {
    return null;
  }
}

/**
 * The GPS lookup.
 * @param onFix Called with the coordinates and the place name (null when there is none).
 * @returns The lookup state and actions.
 */
export function useLocationLookup(onFix: (fix: LocationFix) => void): LocationLookup {
  const [phase, setPhase] = useState<LocationPhase>("idle");
  const [canRetry, setCanRetry] = useState(false);
  const [coords, setCoords] = useState<Coordinates | null>(null);

  const name = useCallback(
    async (point: Coordinates, retries: number): Promise<void> => {
      for (let attempt = 0; ; attempt += 1) {
        try {
          const placeName = await placesApi.lookup(point.lat, point.lon);
          setCanRetry(false);
          setPhase("found");
          onFix({ coords: point, placeName });
          return;
        } catch (error) {
          const code = toApiError(error).code;
          if (code === "GEOCODER_UNAVAILABLE" && attempt < retries) {
            await wait(PLACE_RETRY_DELAY_MS);
            continue;
          }
          setCanRetry(code !== "PLACE_NOT_FOUND");
          setPhase("noName");
          onFix({ coords: point, placeName: null });
          return;
        }
      }
    },
    [onFix],
  );

  const locate = useCallback(async () => {
    setPhase("locating");
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setPhase("denied");
        return;
      }
      const position = await readPosition();
      if (position === null) {
        setPhase("denied");
        return;
      }
      const point = { lat: position.coords.latitude, lon: position.coords.longitude };
      setCoords(point);
      await name(point, 1);
    } catch {
      setPhase("denied");
    }
  }, [name]);

  const retry = useCallback(async () => {
    if (coords !== null) {
      setPhase("locating");
      await name(coords, 0);
    }
  }, [coords, name]);

  return { phase, canRetry, locate, retry };
}
