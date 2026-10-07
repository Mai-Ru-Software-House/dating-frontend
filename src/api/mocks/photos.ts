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
  async deleteTemp(upload) {
    await mockDelay();
    db().uploads.delete(upload.uploadId);
  },
  async replaceMine(photo) {
    const account = await authed();
    saveProfile({ ...account.profile, photoUrl: photo.uri });
    return { photoUrl: photo.uri };
  },
};
