/**
 * photos.ts
 * Photo endpoints: temporary upload before sign-up, its deletion, and replacing the own photo
 * (api-integration.md 6.2, 6.14). Photos are checked with checkProfilePhoto before calling these.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { File } from "expo-file-system";

import { USE_MOCKS } from "../constants/env";
import { UPLOAD_TIMEOUT_MS } from "../constants/limits";
import { fileNameFor, uploadMimeType } from "../utils/photo";
import { request } from "./client";
import { mockPhotosApi } from "./mocks/photos";
import type { PhotoUpload, PickedPhoto } from "./types";

/** Photo endpoints. */
export interface PhotosApi {
  /** POST /photo-uploads (no session). @throws ApiError INVALID_INPUT (field photo). */
  uploadTemp: (photo: PickedPhoto) => Promise<PhotoUpload>;
  /** DELETE /photo-uploads/{uploadId}. @throws ApiError UPLOAD_NOT_FOUND (callers ignore it). */
  deleteTemp: (upload: PhotoUpload) => Promise<void>;
  /** PUT /users/me/photo. @throws ApiError INVALID_INPUT (field photo). */
  replaceMine: (photo: PickedPhoto) => Promise<{ photoUrl: string }>;
}

/**
 * Builds the multipart body with one part named "photo".
 * Expo's fetch (the global fetch in SDK 57) rejects React Native's { uri, name, type } parts
 * ("Unsupported FormDataPart implementation"), so the part is the file itself, read lazily by
 * expo-file-system.
 * @param photo The picked photo.
 * @returns The form data.
 */
export function photoFormData(photo: PickedPhoto): FormData {
  const body = new FormData();
  const name = fileNameFor(photo);
  if (__DEV__) {
    console.log("[photo] picked", photo, "file name", name, "type", uploadMimeType(photo));
  }
  // File implements Blob but is not declared as one; the cast avoids `any`.
  body.append("photo", new File(photo.uri) as unknown as Blob, name);
  return body;
}

const realPhotosApi: PhotosApi = {
  uploadTemp: (photo) =>
    request<PhotoUpload>("POST", "/photo-uploads", {
      formData: photoFormData(photo),
      isAuthenticated: false,
      timeoutMs: UPLOAD_TIMEOUT_MS,
    }),
  async deleteTemp(upload) {
    // How the delete token is sent is open (9.6); header X-Delete-Token until decided.
    await request<void>("DELETE", `/photo-uploads/${encodeURIComponent(upload.uploadId)}`, {
      isAuthenticated: false,
      headers: { "X-Delete-Token": upload.deleteToken },
    });
  },
  replaceMine: (photo) =>
    request<{ photoUrl: string }>("PUT", "/users/me/photo", {
      formData: photoFormData(photo),
      timeoutMs: UPLOAD_TIMEOUT_MS,
    }),
};

/** Photo endpoints, real or mock. */
export const photosApi: PhotosApi = USE_MOCKS ? mockPhotosApi : realPhotosApi;
