/**
 * db.ts
 * The mocks' in-memory state and shared helpers: a 300 ms delay, the logged-in user taken from the
 * mock token, and the optional failures from EXPO_PUBLIC_MOCK_FAIL.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { MOCK_FAIL } from "../../constants/env";
import { MOCK_DELAY_MS } from "../../constants/limits";
import { currentAccessToken, refreshTokensForMock } from "../client";
import { ApiError } from "../errors";
import type { Message, Note, OwnProfile } from "../types";
import { ACCOUNTS, buildMessages, buildNotes, FAVORITES, type MockAccount } from "./fixtures";

/** Everything the mocks remember while the app runs. */
interface MockState {
  accounts: MockAccount[];
  messages: Message[];
  notes: Note[];
  favorites: Map<string, Set<string>>;
  uploads: Map<string, string>;
  nextId: number;
}

let state: MockState | null = null;
let hasExpiredOnce = false;

/**
 * The mock state, built on first use so its times follow the device clock.
 * @returns The state.
 */
export function db(): MockState {
  if (state === null) {
    state = {
      accounts: ACCOUNTS.map((a) => ({ ...a })),
      messages: buildMessages(),
      notes: buildNotes(),
      favorites: new Map([["usr_tee", new Set(FAVORITES)]]),
      uploads: new Map(),
      nextId: 100,
    };
  }
  return state;
}

/**
 * A new unique ID.
 * @param prefix For example "msg".
 * @returns For example "msg_101".
 */
export function newId(prefix: string): string {
  const s = db();
  s.nextId += 1;
  return `${prefix}_${s.nextId}`;
}

/**
 * Waits like a network call.
 * @returns After MOCK_DELAY_MS.
 */
export function mockDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

/**
 * The mock access token for a user.
 * @param userId The user.
 * @returns The token ("mock-at:" + userId).
 */
export function mockTokenFor(userId: string): string {
  return `mock-at:${userId}`;
}

/**
 * Waits, then returns the logged-in mock user, like a call that needs a session.
 * @returns The user's account.
 * @throws ApiError UNAUTHENTICATED when there is no valid mock token.
 */
export async function authed(): Promise<MockAccount> {
  await mockDelay();
  if (MOCK_FAIL === "expire" && !hasExpiredOnce) {
    hasExpiredOnce = true;
    await refreshTokensForMock();
  }
  const token = currentAccessToken() ?? "";
  const userId = token.startsWith("mock-at:") ? token.slice("mock-at:".length) : "";
  const account = db().accounts.find((a) => a.profile.userId === userId);
  if (account === undefined) {
    throw new ApiError(401, "UNAUTHENTICATED", "Session expired");
  }
  return account;
}

/**
 * Replaces a user's profile.
 * @param profile The new profile.
 */
export function saveProfile(profile: OwnProfile): void {
  const account = db().accounts.find((a) => a.profile.userId === profile.userId);
  if (account !== undefined) {
    account.profile = profile;
  }
}

/**
 * A user's favorites set, created when missing.
 * @param userId The user.
 * @returns The set.
 */
export function favoritesOf(userId: string): Set<string> {
  const s = db();
  const existing = s.favorites.get(userId);
  if (existing !== undefined) {
    return existing;
  }
  const created = new Set<string>();
  s.favorites.set(userId, created);
  return created;
}
