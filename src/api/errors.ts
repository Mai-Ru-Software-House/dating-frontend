/**
 * errors.ts
 * The API error shape, the app's copy for each error code (api-integration.md 4.2) and the map
 * from a server field to its Create profile step (4.3).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */

/** Every error code the app knows. NETWORK_ERROR is app-only. */
export type ApiErrorCode =
  | "INVALID_INPUT"
  | "UNAUTHENTICATED"
  | "INVALID_CREDENTIALS"
  | "NOT_FOUND"
  | "USER_NOT_FOUND"
  | "MESSAGE_NOT_FOUND"
  | "PLACE_NOT_FOUND"
  | "PHOTO_NOT_FOUND"
  | "UPLOAD_NOT_FOUND"
  | "USERNAME_TAKEN"
  | "GEOCODER_UNAVAILABLE"
  | "MATCH_ENGINE_UNAVAILABLE"
  | "INTERNAL_ERROR"
  | "NOTE_NOT_FOUND"
  | "NETWORK_ERROR";

const KNOWN_CODES: readonly ApiErrorCode[] = [
  "INVALID_INPUT",
  "UNAUTHENTICATED",
  "INVALID_CREDENTIALS",
  "NOT_FOUND",
  "USER_NOT_FOUND",
  "MESSAGE_NOT_FOUND",
  "PLACE_NOT_FOUND",
  "PHOTO_NOT_FOUND",
  "UPLOAD_NOT_FOUND",
  "USERNAME_TAKEN",
  "GEOCODER_UNAVAILABLE",
  "MATCH_ENGINE_UNAVAILABLE",
  "INTERNAL_ERROR",
  "NOTE_NOT_FOUND",
  "NETWORK_ERROR",
];

/** An error from the API, or NETWORK_ERROR when there was no usable response. */
export class ApiError extends Error {
  /**
   * @param status HTTP status, 0 for NETWORK_ERROR.
   * @param code The error code.
   * @param message The server's message (for logs and as a fallback).
   * @param field Dotted path of the input the error is about, for example "preferences.minAge".
   */
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** The app's copy for each code (api-integration.md 4.2). */
export const ERROR_COPY: Record<ApiErrorCode, string> = {
  INVALID_INPUT: "Check what you entered and try again.",
  UNAUTHENTICATED: "You've been logged out. Log in again.",
  INVALID_CREDENTIALS: "Wrong username or password.",
  NOT_FOUND: "Something went wrong on our side. Try again.",
  USER_NOT_FOUND: "This profile isn't available anymore.",
  MESSAGE_NOT_FOUND: "That message isn't available anymore.",
  PLACE_NOT_FOUND: "No place name for this spot",
  PHOTO_NOT_FOUND: "",
  UPLOAD_NOT_FOUND: "",
  USERNAME_TAKEN: "That username is already in use. Try another one.",
  GEOCODER_UNAVAILABLE: "Location lookup is down. Try again in a minute.",
  MATCH_ENGINE_UNAVAILABLE: "Couldn't load your matches.",
  INTERNAL_ERROR: "Something went wrong on our side. Try again.",
  NOTE_NOT_FOUND: "This note isn't available anymore.",
  NETWORK_ERROR: "Can't reach the server. Check your connection and try again.",
};

/**
 * Checks whether a string is a known error code.
 * @param code Any string.
 * @returns True for a known code.
 */
export function isErrorCode(code: unknown): code is ApiErrorCode {
  return typeof code === "string" && (KNOWN_CODES as readonly string[]).includes(code);
}

/**
 * Turns anything thrown into an ApiError, so callers handle one type.
 * @param error What was caught.
 * @returns The ApiError, or NETWORK_ERROR for anything else.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  const message = error instanceof Error ? error.message : "Unknown error";
  return new ApiError(0, "NETWORK_ERROR", message);
}

/**
 * The text to show for an error.
 * @param error What was caught.
 * @returns The app's copy; for INVALID_INPUT the server's message when it has one.
 */
export function messageFor(error: unknown): string {
  const apiError = toApiError(error);
  if (apiError.code === "INVALID_INPUT" && apiError.message.trim() !== "") {
    return apiError.message;
  }
  return ERROR_COPY[apiError.code];
}

/**
 * Removes a trailing list index from a field path ("preferences.targetGenders.1").
 * @param field A dotted path.
 * @returns The path without a trailing number.
 */
export function normalizeField(field: string): string {
  return field.replace(/\.\d+$/, "");
}

const STEP_ONE_FIELDS = ["displayName", "username", "password", "dateOfBirth", "gender"];
const STEP_TWO_FIELDS = ["photoUploadId", "location", "location.lat", "location.lon"];

/**
 * Which Create profile step owns a server field (api-integration.md 4.3).
 * @param field The error's field.
 * @returns 1, 2 or 3, or null when unknown (show a banner instead).
 */
export function stepForField(field: string | undefined): 1 | 2 | 3 | null {
  if (field === undefined) {
    return null;
  }
  const clean = normalizeField(field);
  if (STEP_ONE_FIELDS.includes(clean)) {
    return 1;
  }
  if (STEP_TWO_FIELDS.includes(clean)) {
    return 2;
  }
  if (clean.startsWith("preferences.") || clean === "preferences") {
    return 3;
  }
  return null;
}
