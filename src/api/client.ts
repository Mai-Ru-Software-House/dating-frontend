/**
 * client.ts
 * The one place that calls fetch. Adds the base URL and the access token, times out after 15 s,
 * turns error responses into ApiError, and on 401 UNAUTHENTICATED runs one shared token refresh and
 * retries the call once (api-integration.md 3.4).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { API_BASE_URL } from "../constants/env";
import { REQUEST_TIMEOUT_MS } from "../constants/limits";
import { ApiError, isErrorCode } from "./errors";
import type { RefreshResult } from "./types";

/** Tokens held by the session store. */
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/** How the client reaches the session store (set once by SessionProvider). */
export interface SessionBridge {
  getTokens: () => Tokens | null;
  saveTokens: (tokens: Tokens) => Promise<void>;
  expire: () => void;
}

/** Query string values; arrays repeat the parameter. */
export type QueryValue = string | number | boolean | readonly (string | number)[] | undefined;

/** Options for request(). */
export interface RequestOptions {
  /** JSON body. */
  body?: unknown;
  /** Multipart body (photo uploads). */
  formData?: FormData;
  /** Query parameters. */
  query?: Record<string, QueryValue>;
  /** Send the access token (default true). Public endpoints pass false and never refresh. */
  isAuthenticated?: boolean;
  /** Extra headers. */
  headers?: Record<string, string>;
}

let bridge: SessionBridge | null = null;
let refreshing: Promise<boolean> | null = null;

/**
 * Connects the client to the session store.
 * @param next The bridge, or null to disconnect.
 */
export function setSessionBridge(next: SessionBridge | null): void {
  bridge = next;
}

/**
 * The current access token, for code that needs it outside request() (photos, mocks).
 * @returns The token, or null when signed out.
 */
export function currentAccessToken(): string | null {
  return bridge?.getTokens()?.accessToken ?? null;
}

/**
 * Mock mode only: re-saves the current tokens as a refresh would, for EXPO_PUBLIC_MOCK_FAIL=expire.
 * @returns After the tokens are saved.
 */
export async function refreshTokensForMock(): Promise<void> {
  const tokens = bridge?.getTokens() ?? null;
  if (tokens !== null) {
    await bridge?.saveTokens({ ...tokens });
  }
}

/**
 * The API's origin (scheme and host), used to build photo URLs.
 * @returns For example "http://10.0.2.2:3000", or "" when no base URL is set.
 */
export function apiOrigin(): string {
  const match = /^(https?:\/\/[^/]+)/i.exec(API_BASE_URL);
  return match === null ? "" : match[1];
}

/**
 * Builds the full URL with the query string.
 * @param path Path after the base URL, starting with "/".
 * @param query Query parameters.
 * @returns The URL.
 */
export function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined) {
      continue;
    }
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
    }
  }
  return `${API_BASE_URL}${path}${parts.length > 0 ? `?${parts.join("&")}` : ""}`;
}

/**
 * Reads an error body into an ApiError.
 * @param response The non-2xx response.
 * @returns The ApiError (NETWORK_ERROR when the body is not the error shape).
 */
async function errorFrom(response: Response): Promise<ApiError> {
  try {
    const data: unknown = await response.json();
    const error = (data as { error?: { code?: unknown; message?: unknown; field?: unknown } })
      ?.error;
    if (error !== undefined && isErrorCode(error.code)) {
      const message = typeof error.message === "string" ? error.message : "";
      const field = typeof error.field === "string" ? error.field : undefined;
      return new ApiError(response.status, error.code, message, field);
    }
  } catch {
    // Not JSON: handled below.
  }
  return new ApiError(0, "NETWORK_ERROR", `Unexpected response (${response.status})`);
}

/**
 * Sends one HTTP request with a timeout.
 * @param method HTTP method.
 * @param url Full URL.
 * @param options Body and headers.
 * @param accessToken Token to send, if any.
 * @returns The response.
 * @throws ApiError NETWORK_ERROR on no response or timeout.
 */
async function send(
  method: string,
  url: string,
  options: RequestOptions,
  accessToken: string | null,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers: Record<string, string> = { Accept: "application/json", ...options.headers };
  if (accessToken !== null) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  let body: string | FormData | undefined;
  if (options.formData !== undefined) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }
  try {
    return await fetch(url, { method, headers, body, signal: controller.signal });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed";
    throw new ApiError(0, "NETWORK_ERROR", message);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Runs the token refresh, shared by every request that got a 401 meanwhile.
 * @returns True when new tokens were saved; false when the session is over.
 * @throws ApiError NETWORK_ERROR when the refresh could not reach the server (tokens are kept).
 */
async function refreshOnce(): Promise<boolean> {
  if (refreshing === null) {
    refreshing = (async () => {
      const tokens = bridge?.getTokens() ?? null;
      if (tokens === null || tokens.refreshToken === "") {
        return false;
      }
      const response = await send(
        "POST",
        buildUrl("/sessions/refresh"),
        { body: { refreshToken: tokens.refreshToken } },
        null,
      );
      if (!response.ok) {
        const error = await errorFrom(response);
        if (error.code === "NETWORK_ERROR") {
          throw error;
        }
        return false;
      }
      const result = (await response.json()) as RefreshResult;
      await bridge?.saveTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken ?? tokens.refreshToken,
      });
      return true;
    })();
    refreshing.then(
      () => {
        refreshing = null;
      },
      () => {
        refreshing = null;
      },
    );
  }
  return refreshing;
}

/**
 * Parses a successful response.
 * @param response A 2xx response.
 * @returns The JSON body, or undefined for an empty body.
 * @throws ApiError NETWORK_ERROR when the body is not JSON.
 */
async function parse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (text === "") {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Response is not JSON");
  }
}

/**
 * Calls the API.
 * @param method HTTP method.
 * @param path Path after the base URL, for example "/conversations".
 * @param options Body, query and whether to send the token.
 * @returns The parsed JSON body (undefined for 204).
 * @throws ApiError for every failure: error responses, no response, timeout, ended session.
 */
export async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const isAuthenticated = options.isAuthenticated ?? true;
  const url = buildUrl(path, options.query);
  const token = isAuthenticated ? (bridge?.getTokens()?.accessToken ?? null) : null;
  const response = await send(method, url, options, token);
  if (response.ok) {
    return parse<T>(response);
  }
  const error = await errorFrom(response);
  if (!isAuthenticated || error.code !== "UNAUTHENTICATED") {
    throw error;
  }
  const isRefreshed = await refreshOnce();
  if (!isRefreshed) {
    bridge?.expire();
    throw error;
  }
  const retryToken = bridge?.getTokens()?.accessToken ?? null;
  const retry = await send(method, url, options, retryToken);
  if (retry.ok) {
    return parse<T>(retry);
  }
  const retryError = await errorFrom(retry);
  if (retryError.code === "UNAUTHENTICATED") {
    bridge?.expire();
  }
  throw retryError;
}

/**
 * Image source for a photo path, with the session header (api-integration.md 6.12).
 * @param photoUrl Path such as "/api/v1/photos/pho_b2".
 * @param accessToken The current access token, or null.
 * @returns The uri and headers for expo-image.
 */
export function photoSource(
  photoUrl: string,
  accessToken: string | null,
): { uri: string; headers?: Record<string, string> } {
  const uri = /^[a-z][a-z0-9+.-]*:/i.test(photoUrl) ? photoUrl : `${apiOrigin()}${photoUrl}`;
  return accessToken === null
    ? { uri }
    : { uri, headers: { Authorization: `Bearer ${accessToken}` } };
}
