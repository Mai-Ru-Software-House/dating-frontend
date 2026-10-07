/**
 * env.ts
 * Build-time settings read from EXPO_PUBLIC_ environment variables (.env.example lists them).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */

/** True when the app runs on the built-in mock data instead of the backend. */
export const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === "1";

/** Base URL of the API, for example http://10.0.2.2:3000/api/v1. No trailing slash. */
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

/** Optional mock failure: "match" or "expire" (api-integration.md 10). */
export const MOCK_FAIL = process.env.EXPO_PUBLIC_MOCK_FAIL ?? "";
