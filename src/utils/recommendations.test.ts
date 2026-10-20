/**
 * recommendations.test.ts
 * UT-REC: load more, duplicates and the top card (unit-test-plan.md 6.14).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { ALICE_RECOMMENDATIONS } from "../../test/fixtures/seed";
import { dedupeCandidates, nextOffset, splitTopMatch } from "./recommendations";

const [BOB, CHAI] = ALICE_RECOMMENDATIONS;

describe("nextOffset", () => {
  it("UT-REC-01: load more continues from the cards already loaded", () => {
    expect([nextOffset(true, 10), nextOffset(true, 40)]).toEqual([10, 40]);
  });

  it("UT-REC-02: stops when the server has no more, or at 200 cards", () => {
    expect([nextOffset(false, 13), nextOffset(true, 200), nextOffset(true, 195)]).toEqual([
      null,
      null,
      null,
    ]);
  });
});

describe("dedupeCandidates", () => {
  it("UT-REC-03: no one appears twice and the order is kept", () => {
    const cards = dedupeCandidates([BOB, CHAI, BOB]);

    expect(cards.map((c) => c.displayName)).toEqual(["Bob", "Chai"]);
  });
});

describe("splitTopMatch", () => {
  it("UT-REC-04: the first result is the card and the rest are rows", () => {
    const split = splitTopMatch([BOB, CHAI]);
    const empty = splitTopMatch([]);

    expect(split).toEqual({ card: BOB, rows: [CHAI] });
    expect(empty).toEqual({ card: null, rows: [] });
  });
});
