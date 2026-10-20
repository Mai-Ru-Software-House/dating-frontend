/**
 * profile.ts (mock)
 * Mock profile endpoints. Username "nok" is always taken; sign-up creates an in-memory account.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { MIN_AGE } from "../../constants/limits";
import { ageOn } from "../../utils/age";
import { usernameRule } from "../../utils/rules";
import { ApiError } from "../errors";
import type { ProfileApi } from "../profile";
import { authed, db, favoritesOf, mockDelay, mockTokenFor, newId, saveProfile } from "./db";
import { PEOPLE } from "./fixtures";

/**
 * Whether a username is taken in the mocks.
 * @param username The name.
 * @returns True when taken.
 */
function isTaken(username: string): boolean {
  const lower = username.toLowerCase();
  return lower === "nok" || db().accounts.some((a) => a.profile.username.toLowerCase() === lower);
}

export const mockProfileApi: ProfileApi = {
  /**
   * Mock of GET /users/me.
   * @returns The signed-in user's profile.
   * @throws ApiError UNAUTHENTICATED when no one is signed in.
   */
  async getMe() {
    const account = await authed();
    return { ...account.profile };
  },
  /**
   * Mock of GET /users/{userId}.
   * @param userId The person.
   * @returns Their profile, with whether I favorited them.
   * @throws ApiError USER_NOT_FOUND for an unknown person.
   * @throws ApiError UNAUTHENTICATED when no one is signed in.
   */
  async getUser(userId) {
    const me = await authed();
    const person = PEOPLE.find((p) => p.userId === userId);
    if (person === undefined) {
      throw new ApiError(404, "USER_NOT_FOUND", "No user with that ID");
    }
    return { ...person, isFavorite: favoritesOf(me.profile.userId).has(userId) };
  },
  /**
   * Mock of GET /usernames/{username}.
   * @param username The username to check.
   * @returns True when the name is free.
   * @throws ApiError INVALID_INPUT when the name has the wrong format.
   */
  async checkUsername(username) {
    await mockDelay();
    if (!usernameRule(username).isValid) {
      throw new ApiError(400, "INVALID_INPUT", "Bad username format", "username");
    }
    return !isTaken(username);
  },
  /**
   * Mock of POST /users.
   * @param body The new profile and its photo upload ID.
   * @returns The new session and profile.
   * @throws ApiError USERNAME_TAKEN when the name is in use.
   * @throws ApiError INVALID_INPUT when the person is under 18 or the photo upload expired.
   */
  async createProfile(body) {
    await mockDelay();
    if (isTaken(body.username)) {
      throw new ApiError(409, "USERNAME_TAKEN", "Username taken", "username");
    }
    if ((ageOn(body.dateOfBirth) ?? 0) < MIN_AGE) {
      throw new ApiError(400, "INVALID_INPUT", "Too young", "dateOfBirth");
    }
    const photoUri = db().uploads.get(body.photoUploadId);
    if (photoUri === undefined) {
      throw new ApiError(400, "INVALID_INPUT", "Upload expired", "photoUploadId");
    }
    const userId = newId("usr");
    const profile = {
      userId,
      username: body.username,
      displayName: body.displayName,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      location: body.location,
      placeName: body.location.lat === 12.5 ? null : "Bangkok, Lat Krabang",
      photoUrl: photoUri,
      preferences: body.preferences,
    };
    db().accounts.push({ password: body.password, profile });
    return { accessToken: mockTokenFor(userId), refreshToken: "mock-rt", userId, profile };
  },
  /**
   * Mock of PATCH /users/me.
   * @param body The fields to change.
   * @returns The updated profile.
   * @throws ApiError UNAUTHENTICATED when no one is signed in.
   */
  async updateMe(body) {
    const account = await authed();
    const next = { ...account.profile, ...body };
    if (body.location !== undefined) {
      next.placeName = "Bangkok, Lat Krabang";
    }
    saveProfile(next);
    return { ...next };
  },
};
