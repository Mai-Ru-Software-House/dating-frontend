/**
 * knownAccounts.test.ts
 * UT-ACC: accounts remembered on the phone for Switch user (unit-test-plan.md 6.10).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { NOW } from "../../test/fixtures/clock";
import { summaryOf, USERS } from "../../test/fixtures/seed";
import { secureStoreData } from "../../test/secureStore";
import { forgetAccount, loadAccounts, rememberAccount } from "./knownAccounts";

const KEY = "mairu.knownAccounts";

/**
 * The public fields of a seed user, as remembered after a login.
 * @param username A seed username.
 * @returns userId, username, displayName and photoUrl.
 */
function accountOf(username: string): Parameters<typeof rememberAccount>[0] {
  return { ...summaryOf(username), username };
}

describe("rememberAccount", () => {
  it("UT-ACC-01: most recent first, no duplicates, at most 5", async () => {
    const order = ["alice", "bob", "chai", "dan", "ekk", "fah", "alice"];

    for (const [i, name] of order.entries()) {
      await rememberAccount(accountOf(name), new Date(NOW.getTime() + i * 1000));
    }
    const list = await loadAccounts();

    expect(list.map((a) => a.username)).toEqual(["alice", "fah", "ekk", "dan", "chai"]);
  });

  it("UT-ACC-02: never stores a token or password", async () => {
    const withSecrets = {
      ...accountOf("alice"),
      accessToken: "at1",
      refreshToken: "rt1",
      password: USERS.alice.password,
    };

    await rememberAccount(withSecrets, NOW);
    const stored = JSON.parse(secureStoreData.get(KEY) ?? "[]") as Record<string, unknown>[];

    expect(Object.keys(stored[0]).sort()).toEqual(
      ["displayName", "lastUsedAt", "photoUrl", "userId", "username"].sort(),
    );
  });
});

describe("forgetAccount", () => {
  it("UT-ACC-03: removes only that account", async () => {
    await rememberAccount(accountOf("alice"), NOW);
    await rememberAccount(accountOf("bob"), NOW);

    const list = await forgetAccount(USERS.alice.userId);

    expect(list.map((a) => a.username)).toEqual(["bob"]);
  });
});

describe("loadAccounts", () => {
  it("UT-ACC-04: a broken stored value gives an empty list", async () => {
    secureStoreData.set(KEY, "{not json");

    const list = await loadAccounts();

    expect(list).toEqual([]);
  });
});
