/**
 * tokenStore.ts
 * Access and refresh tokens in expo-secure-store (Keychain / Keystore), never in AsyncStorage or
 * logs (api-integration.md 3.1).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import * as SecureStore from "expo-secure-store";

import type { Tokens } from "../api/client";

const ACCESS_KEY = "mairu.accessToken";
const REFRESH_KEY = "mairu.refreshToken";

/**
 * Reads the stored tokens.
 * @returns The tokens, or null when there is no access token.
 * @throws Error when secure storage can't be read.
 */
export async function readTokens(): Promise<Tokens | null> {
  const accessToken = await SecureStore.getItemAsync(ACCESS_KEY);
  if (accessToken === null || accessToken === "") {
    return null;
  }
  const refreshToken = (await SecureStore.getItemAsync(REFRESH_KEY)) ?? "";
  return { accessToken, refreshToken };
}

/**
 * Stores both tokens.
 * @param tokens The tokens; an empty refresh token deletes the stored one.
 * @throws Error when secure storage can't be written.
 */
export async function writeTokens(tokens: Tokens): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken);
  if (tokens.refreshToken === "") {
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  } else {
    await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
  }
}

/**
 * Deletes both tokens.
 * @throws Error when secure storage can't be written.
 */
export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}
