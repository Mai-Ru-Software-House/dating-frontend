/**
 * limits.ts
 * Every limit the app checks, with the values from unit-test-plan.md 4.1. They must match the
 * server's rules exactly; the server's answer always wins.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */

/** Username length (A1). */
export const USERNAME_MIN = 4;
export const USERNAME_MAX = 20;

/** Allowed username characters (A1): A to Z, a to z, 0 to 9 and underscore. */
export const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;

/** Minimum password length (A2); it also needs at least one letter and one digit. */
export const PASSWORD_MIN = 8;

/** Minimum age for a profile and for preference ages (A3). */
export const MIN_AGE = 18;

/** Accepted profile photo types and file extensions (A5). */
export const PROFILE_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const PROFILE_PHOTO_EXTENSIONS = ["png", "jpg", "jpeg", "webp"] as const;

/** Largest profile photo in bytes: 1 MB taken as 1024 × 1024 (A5, P3). */
export const PROFILE_PHOTO_MAX_BYTES = 1_048_576;

/** Longest message after trimming, counted with string.length (A6, P19). */
export const MESSAGE_MAX = 1000;

/** Longest note after trimming, counted with string.length (A7). */
export const NOTE_MAX = 500;

/** Ends of the age slider (design.md 6.6). */
export const AGE_SLIDER_MIN = 18;
export const AGE_SLIDER_MAX = 40;

/** Ends of the distance slider in km (design.md 6.6). */
export const DISTANCE_SLIDER_MIN = 1;
export const DISTANCE_SLIDER_MAX = 100;

/** Default preferences on Create profile step 3 (design.md 6.6). */
export const DEFAULT_MIN_AGE = 18;
export const DEFAULT_MAX_AGE = 25;
export const DEFAULT_RADIUS_KM = 50;

/** Recommendations page size and the most the app asks for (answer 7). */
export const RECOMMENDATIONS_PAGE = 10;
export const RECOMMENDATIONS_MAX = 50;

/** Search results per request (contract default). */
export const SEARCH_LIMIT = 20;

/** Messages per page in a conversation, and unread messages fetched for Home. */
export const MESSAGES_PAGE = 30;
export const UNREAD_LIMIT = 50;

/** Wait after the last keystroke before checking a username. */
export const USERNAME_CHECK_DEBOUNCE_MS = 500;

/** Request timeout. */
export const REQUEST_TIMEOUT_MS = 15_000;

/** Messages from one sender closer than this form one group. */
export const MESSAGE_GROUP_GAP_MS = 5 * 60 * 1000;

/** Accounts remembered on this phone. */
export const KNOWN_ACCOUNTS_MAX = 5;

/** Days back that list times show a weekday instead of a date. */
export const WEEKDAY_WINDOW_DAYS = 6;

/** Unread counts above this show as "9+". */
export const UNREAD_BADGE_MAX = 9;

/** Re-upload a temporary photo when it expires sooner than this. */
export const UPLOAD_REFRESH_MARGIN_MS = 60_000;

/** Delay before the one automatic retry of a place lookup (api-integration.md 6.3). */
export const PLACE_RETRY_DELAY_MS = 2000;

/** Delay added by every mock API call. */
export const MOCK_DELAY_MS = 300;
