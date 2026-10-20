/**
 * photos.ts (mock)
 * Mock photo endpoints. The picked photo's local URI stands in for the photo URL, so a new photo
 * shows in the app.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { PhotosApi } from "../photos";
import { authed, db, mockDelay, newId, saveProfile } from "./db";

const UPLOAD_LIFETIME_MS = 60 * 60 * 1000;

export const mockPhotosApi: PhotosApi = {
  /**
   * Mock of POST /photo-uploads: remembers the picked photo's URI for an hour.
   * @param photo The picked photo.
   * @returns The upload: its ID, expiry and delete token.
   */
  async uploadTemp(photo) {
    await mockDelay();
    const uploadId = newId("upl");
    db().uploads.set(uploadId, photo.uri);
    return {
      uploadId,
      expiresAt: new Date(Date.now() + UPLOAD_LIFETIME_MS).toISOString(),
      deleteToken: `del-${uploadId}`,
    };
  },
  /**
   * Mock of DELETE /photo-uploads/{uploadId}.
   * @param upload The upload to forget.
   * @returns After the upload is forgotten.
   */
  async deleteTemp(upload) {
    await mockDelay();
    db().uploads.delete(upload.uploadId);
  },
  /**
   * Mock of PUT /users/me/photo.
   * @param photo The picked photo.
   * @returns The new photo URL.
   * @throws ApiError UNAUTHENTICATED when no one is signed in.
   */
  async replaceMine(photo) {
    const account = await authed();
    saveProfile({ ...account.profile, photoUrl: photo.uri });
    return { photoUrl: photo.uri };
  },
};
