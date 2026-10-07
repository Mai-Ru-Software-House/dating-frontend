/**
 * photos.ts
 * Photo endpoints: temporary upload before sign-up, its deletion, and replacing the own photo
 * (api-integration.md 6.2, 6.14). Photos are checked with checkProfilePhoto before calling these.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { USE_MOCKS } from "../constants/env";
import { fileNameFor, photoMimeType } from "../utils/photo";
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
 * @param photo The picked photo.
 * @returns The form data.
 */
export function photoFormData(photo: PickedPhoto): FormData {
  const body = new FormData();
  // React Native's FormData accepts { uri, name, type }; the cast avoids `any`.
  body.append("photo", {
    uri: photo.uri,
    name: fileNameFor(photo),
    type: photoMimeType(photo),
  } as unknown as Blob);
  return body;
}

const realPhotosApi: PhotosApi = {
  uploadTemp: (photo) =>
    request<PhotoUpload>("POST", "/photo-uploads", {
      formData: photoFormData(photo),
      isAuthenticated: false,
    }),
  async deleteTemp(upload) {
    // How the delete token is sent is open (9.6); header X-Delete-Token until decided.
    await request<void>("DELETE", `/photo-uploads/${encodeURIComponent(upload.uploadId)}`, {
      isAuthenticated: false,
      headers: { "X-Delete-Token": upload.deleteToken },
    });
  },
  replaceMine: (photo) =>
    request<{ photoUrl: string }>("PUT", "/users/me/photo", { formData: photoFormData(photo) }),
};

/** Photo endpoints, real or mock. */
export const photosApi: PhotosApi = USE_MOCKS ? mockPhotosApi : realPhotosApi;
