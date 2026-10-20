/**
 * createAccount.ts
 * The network side of Create profile's Submit: refreshing an expiring photo upload, sending
 * POST /users, and deciding where a server error should show (api-integration.md 4.3, 6.2).
 * Created by Tee (Kittiphon Kijpinyochai), 20 October 2026
 */
import { ERROR_COPY, messageFor, normalizeField, stepForField, toApiError } from "../../api/errors";
import { photosApi } from "../../api/photos";
import { profileApi } from "../../api/profile";
import { UPLOAD_REFRESH_MARGIN_MS } from "../../constants/limits";
import type { SessionApi } from "../../session/SessionProvider";
import {
  formFieldFor,
  toCreateBody,
  type CreateProfileForm,
  type Step,
  type TempPhoto,
} from "./createProfileSchema";

/** Where a server error should show. */
export type ServerFailure =
  | { kind: "username" }
  | { kind: "field"; field: keyof CreateProfileForm; step: Step; message: string }
  | { kind: "banner"; message: string };

/**
 * Re-uploads the photo when its temporary upload is about to expire.
 * @param photo The current photo.
 * @returns The photo with a fresh upload when needed.
 * @throws ApiError when the upload fails.
 */
async function freshPhoto(photo: TempPhoto): Promise<TempPhoto> {
  const expiresIn = Date.parse(photo.upload.expiresAt) - Date.now();
  if (expiresIn > UPLOAD_REFRESH_MARGIN_MS) {
    return photo;
  }
  return { local: photo.local, upload: await photosApi.uploadTemp(photo.local) };
}

/**
 * Creates the account and logs in. When the server says the photo upload is no longer valid, the
 * photo is uploaded again and the request is repeated once.
 * @param values The form values.
 * @param photo The chosen photo.
 * @param session The session, to log in with the new account.
 * @param replacePhoto Called with the new upload when the photo had to be uploaded again.
 * @returns After the account is created and logged in.
 * @throws ApiError when creating the account or the photo upload fails.
 */
export async function createAccount(
  values: CreateProfileForm,
  photo: TempPhoto,
  session: SessionApi,
  replacePhoto: (photo: TempPhoto) => void,
): Promise<void> {
  const current = await freshPhoto(photo);
  const body = toCreateBody({ ...values, photo: current });
  if (body === null) {
    return;
  }
  try {
    await session.logIn(await profileApi.createProfile(body));
  } catch (error) {
    const apiError = toApiError(error);
    if (apiError.code !== "INVALID_INPUT" || apiError.field !== "photoUploadId") {
      throw error;
    }
    const replaced = { local: current.local, upload: await photosApi.uploadTemp(current.local) };
    replacePhoto(replaced);
    const retryBody = toCreateBody({ ...values, photo: replaced });
    if (retryBody !== null) {
      await session.logIn(await profileApi.createProfile(retryBody));
    }
  }
}

/**
 * Decides where a server error shows: under the username, under the field it names (and the step
 * that owns it), or in the banner.
 * @param error What Submit threw.
 * @returns Where to show it.
 */
export function describeFailure(error: unknown): ServerFailure {
  const apiError = toApiError(error);
  const field = apiError.field === undefined ? null : normalizeField(apiError.field);
  const target = field === null ? null : formFieldFor(field);
  const owner = stepForField(field ?? undefined);
  if (apiError.code === "USERNAME_TAKEN") {
    return { kind: "username" };
  }
  if (apiError.code === "INVALID_INPUT" && target !== null && owner !== null) {
    return {
      kind: "field",
      field: target,
      step: owner,
      message: apiError.message || ERROR_COPY.INVALID_INPUT,
    };
  }
  return { kind: "banner", message: messageFor(apiError) };
}
