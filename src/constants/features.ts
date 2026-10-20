/**
 * features.ts
 * Feature flags for designed screens the backend may not support yet.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */

/** The feature flags; typed as booleans because a flag is meant to be flipped. */
export interface Features {
  editProfile: boolean;
  manageNotes: boolean;
  typingIndicator: boolean;
}

/** Feature flags. */
export const FEATURES: Features = {
  /** Edit profile (design.md 6.17): PATCH /users/me and PUT /users/me/photo exist. */
  editProfile: true,
  /** Edit and delete a note (design.md 6.15): PATCH and DELETE /notes/{noteId} exist. */
  manageNotes: true,
  /** Typing indicator (design.md 3.16): the API has no typing status. */
  typingIndicator: false,
};
