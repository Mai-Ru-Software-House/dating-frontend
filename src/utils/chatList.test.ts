/**
 * chatList.test.ts
 * UT-CHL: chat list sections and search (unit-test-plan.md 6.13).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { ALICE_CHATS, ALICE_FAVORITES, USERS } from "../../test/fixtures/seed";
import { filterChats, splitChats } from "./chatList";

const names = (list: { user: { displayName: string } }[]): string[] =>
  list.map((c) => c.user.displayName);

describe("splitChats", () => {
  it("UT-CHL-01: puts favorites on top", () => {
    const sections = splitChats(ALICE_CHATS, ALICE_FAVORITES);

    expect(names(sections.favorites)).toEqual(["Chai"]);
    expect(names(sections.others)).toEqual(["Bob", "Hana"]);
  });

  it("UT-CHL-02: keeps the server order inside each section", () => {
    const sections = splitChats(ALICE_CHATS, ALICE_FAVORITES);

    expect(names(sections.others)).toEqual(["Bob", "Hana"]);
  });

  it("UT-CHL-03: the favorites set wins over a stale isFavorite on the row", () => {
    const favorites = new Set([USERS.chai.userId, USERS.bob.userId]);

    const sections = splitChats(ALICE_CHATS, favorites);

    expect(ALICE_CHATS[0].isFavorite).toBe(false);
    expect(names(sections.favorites)).toContain("Bob");
  });
});

describe("filterChats", () => {
  it("UT-CHL-04: searches by name, ignoring case", () => {
    const bob = filterChats(ALICE_CHATS, "BO");
    const none = filterChats(ALICE_CHATS, "ไม่มี");

    expect(names(bob)).toEqual(["Bob"]);
    expect(none).toEqual([]);
  });
});
