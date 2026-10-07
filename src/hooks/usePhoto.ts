/**
 * usePhoto.ts
 * Image source and placeholder gradient for a person's photo. Photos need the session header
 * (api-integration.md 6.12). In mock mode there is no photo server, so server paths are skipped
 * and the placeholder shows; photos picked on the phone still load.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { currentAccessToken, photoSource } from "../api/client";
import { MOCK_GRADIENT_INDEX } from "../api/mocks/fixtures";
import { USE_MOCKS } from "../constants/env";
import { avatarGradients } from "../theme";
import { gradientIndex } from "../utils/avatar";

/** An image source for expo-image. */
export interface PhotoSource {
  uri: string;
  headers?: Record<string, string>;
}

/**
 * The image source for a photo path.
 * @param photoUrl Path such as "/api/v1/photos/pho_b2", or a local file URI.
 * @returns The source, or null when there is nothing to load.
 */
export function usePhotoSource(photoUrl: string | null | undefined): PhotoSource | null {
  if (!photoUrl) {
    return null;
  }
  if (USE_MOCKS && photoUrl.startsWith("/")) {
    return null;
  }
  return photoSource(photoUrl, currentAccessToken());
}

/**
 * The placeholder gradient for a person.
 * @param userId The user's ID.
 * @returns The two gradient colors.
 */
export function gradientFor(userId: string): readonly [string, string] {
  const overrides = USE_MOCKS ? MOCK_GRADIENT_INDEX : {};
  return avatarGradients[gradientIndex(userId, avatarGradients.length, overrides)];
}
