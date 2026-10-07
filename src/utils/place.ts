/**
 * place.ts
 * Place names. The API sends "province, district" as one string (for example "Bangkok, Min Buri");
 * the designs show the district first (design.md 5, section 8 row 11).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */

/** "short": district only (cards, rows). "full": district, then province (profiles). */
export type PlaceStyle = "short" | "full";

/**
 * Formats a place name for display.
 * @param placeName The API's "province, district" string, or null.
 * @param style "short" or "full".
 * @returns The text to show, or null when there is no place name (the caller hides the line).
 */
export function formatPlace(
  placeName: string | null | undefined,
  style: PlaceStyle,
): string | null {
  if (placeName === null || placeName === undefined || placeName.trim() === "") {
    return null;
  }
  const commaAt = placeName.indexOf(", ");
  if (commaAt === -1) {
    return placeName;
  }
  const province = placeName.slice(0, commaAt);
  const district = placeName.slice(commaAt + 2);
  return style === "short" ? district : `${district}, ${province}`;
}

/**
 * Formats GPS coordinates with 3 decimals and compass letters.
 * @param lat Latitude.
 * @param lon Longitude.
 * @returns For example "13.723° N, 100.784° E".
 */
export function formatCoordinates(lat: number, lon: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}° ${ns}, ${Math.abs(lon).toFixed(3)}° ${ew}`;
}
