/**
 * recommendations.test.ts
 * UT-REC: load more, duplicates and the top card (unit-test-plan.md 6.14).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { ALICE_RECOMMENDATIONS } from "../../test/fixtures/seed";
import { dedupeCandidates, nextLimit, splitTopMatch } from "./recommendations";

const [BOB, CHAI] = ALICE_RECOMMENDATIONS;

describe("nextLimit", () => {
  it("UT-REC-01: load more grows by 10 up to 50", () => {
    const limits = [
      [10, 10],
      [40, 40],
      [50, 50],
    ].map(([limit, got]) => nextLimit(limit, got));

    expect(limits).toEqual([20, 50, null]);
  });

  it("UT-REC-02: a short page stops loading", () => {
    const limit = nextLimit(20, 13);

    expect(limit).toBeNull();
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
