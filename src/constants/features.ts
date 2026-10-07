/**
 * features.ts
 * Feature flags for designed screens the backend does not support yet. With mocks on, every
 * designed screen is visible; a real build hides what the contract lacks.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { USE_MOCKS } from "./env";

/** Feature flags. */
export const FEATURES = {
  /** Edit profile (design.md 6.17): waits for PATCH /users/me to be confirmed. */
  editProfile: USE_MOCKS,
  /** Edit and delete a note (design.md 6.15): waits for PATCH and DELETE /notes/{noteId}. */
  manageNotes: USE_MOCKS,
  /** Typing indicator (design.md 3.16): the API has no typing status. */
  typingIndicator: false,
} as const;
