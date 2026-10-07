/**
 * secureStore.ts
 * The in-memory map behind the expo-secure-store mock, so tests can read what was stored.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */

/** Every key and value written to secure storage in the current test. Cleared before each test. */
export const secureStoreData = new Map<string, string>();
