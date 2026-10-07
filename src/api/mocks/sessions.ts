/**
 * sessions.ts (mock)
 * Mock login: "Kittiphon" with any password except "wrong" logs in as Tee; the remembered Mai
 * accounts use "password123" (api-integration.md 10).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { ApiError } from "../errors";
import type { SessionsApi } from "../sessions";
import { db, mockDelay, mockTokenFor } from "./db";

export const mockSessionsApi: SessionsApi = {
  async logIn(username, password) {
    await mockDelay();
    if (username.trim() === "") {
      throw new ApiError(400, "INVALID_INPUT", "Username is required.", "username");
    }
    const account = db().accounts.find(
      (a) => a.profile.username.toLowerCase() === username.trim().toLowerCase(),
    );
    const isRight =
      account !== undefined &&
      (account.password === null ? password !== "wrong" : account.password === password);
    if (account === undefined || !isRight) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Wrong username or password.");
    }
    return {
      accessToken: mockTokenFor(account.profile.userId),
      refreshToken: "mock-rt",
      userId: account.profile.userId,
    };
  },
  async logOut() {
    await mockDelay();
  },
};
