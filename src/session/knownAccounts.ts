/**
 * knownAccounts.ts
 * Accounts remembered on this phone for Switch user (api-integration.md 3.5): at most 5, most
 * recent first, with no token or password ever stored.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import * as SecureStore from "expo-secure-store";

import { KNOWN_ACCOUNTS_MAX } from "../constants/limits";

const KEY = "mairu.knownAccounts";

/** One remembered account. */
export interface KnownAccount {
  userId: string;
  username: string;
  displayName: string;
  photoUrl: string;
  lastUsedAt: string;
}

/**
 * Adds or moves an account to the top of the list.
 * @param list The current list.
 * @param account The account (only its public fields are kept).
 * @returns The new list: most recent first, no duplicates, at most 5.
 */
export function mergeAccount(list: readonly KnownAccount[], account: KnownAccount): KnownAccount[] {
  const entry: KnownAccount = {
    userId: account.userId,
    username: account.username,
    displayName: account.displayName,
    photoUrl: account.photoUrl,
    lastUsedAt: account.lastUsedAt,
  };
  return [entry, ...list.filter((a) => a.userId !== entry.userId)].slice(0, KNOWN_ACCOUNTS_MAX);
}

/**
 * Checks a parsed value is a list of accounts.
 * @param value Anything.
 * @returns The valid entries.
 */
function toAccounts(value: unknown): KnownAccount[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (a): a is KnownAccount =>
      typeof a === "object" &&
      a !== null &&
      typeof (a as KnownAccount).userId === "string" &&
      typeof (a as KnownAccount).username === "string",
  );
}

/**
 * Reads the list. A missing or broken value gives an empty list.
 * @returns The accounts, most recent first.
 */
export async function loadAccounts(): Promise<KnownAccount[]> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw === null ? [] : toAccounts(JSON.parse(raw));
  } catch {
    return [];
  }
}

/**
 * Whether the list has ever been written on this phone.
 * @returns True when a value exists.
 */
export async function hasStoredAccounts(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(KEY)) !== null;
  } catch {
    return false;
  }
}

/**
 * Writes the list.
 * @param list The accounts.
 * @throws Error when secure storage can't be written.
 */
export async function saveAccounts(list: readonly KnownAccount[]): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(list));
}

/**
 * Remembers an account after a login or sign-up.
 * @param account The account's public fields.
 * @param now The current time (default: the device clock).
 * @returns The new list.
 * @throws Error when secure storage can't be written.
 */
export async function rememberAccount(
  account: Omit<KnownAccount, "lastUsedAt">,
  now: Date = new Date(),
): Promise<KnownAccount[]> {
  const next = mergeAccount(await loadAccounts(), { ...account, lastUsedAt: now.toISOString() });
  await saveAccounts(next);
  return next;
}

/**
 * Forgets one account on this phone.
 * @param userId The account to remove.
 * @returns The new list.
 * @throws Error when secure storage can't be written.
 */
export async function forgetAccount(userId: string): Promise<KnownAccount[]> {
  const next = (await loadAccounts()).filter((a) => a.userId !== userId);
  await saveAccounts(next);
  return next;
}
